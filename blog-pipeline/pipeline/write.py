import json
import logging
import re
import unicodedata

from anthropic import Anthropic

from . import config, db
from .prompts import WRITER_SYSTEM_PROMPT

logger = logging.getLogger("blog_pipeline.write")


def slugify(title: str) -> str:
    normalized = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug[:80] or "artigo"


def _client() -> Anthropic:
    return Anthropic(api_key=config.require_api_key())


def _extract_text(response) -> str:
    return "".join(block.text for block in response.content if block.type == "text")


def write_article(client: Anthropic, conn, item: dict):
    """Devolve um dict de rascunho pronto pra publicar, ou None se a redação
    falhar ou sair fora do esperado — nunca lança, pra um item problemático
    não derrubar a execução inteira."""
    prompt = (
        f"Categoria: {item['category']}\n"
        f"Fonte: {item.get('source_name', '')}\n"
        f"Título original: {item['title']}\n"
        f"Resumo/trecho da fonte: {item['summary'][:2000]}\n"
        f"Link da fonte: {item['link']}\n\n"
        "Escreva um artigo original com base nessa fonte, seguindo todas as regras do seu prompt de sistema."
    )

    try:
        response = client.messages.create(
            model=config.WRITE_MODEL,
            # O Sonnet 5.5 pensa antes de responder e isso conta no limite: com folga, o JSON
            # do artigo não sai cortado.
            max_tokens=16000,
            system=WRITER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as exc:
        logger.warning("Falha ao escrever artigo pra '%s': %s", item["title"], exc)
        return None

    db.log_token_usage(conn, "write", response.usage.input_tokens, response.usage.output_tokens)

    text = _extract_text(response)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        logger.warning("Resposta de redação não é JSON válido pra '%s': %s", item["title"], exc)
        return None

    required_keys = {"title", "excerpt", "body_markdown", "sources_used"}
    if not required_keys.issubset(data.keys()):
        logger.warning("Resposta de redação incompleta pra '%s' — faltam chaves esperadas.", item["title"])
        return None

    word_count = len(data["body_markdown"].split())
    if word_count < config.MIN_WORDS:
        logger.warning(
            "Artigo '%s' saiu muito curto (%d palavras) — descartado, não publicado.", data["title"], word_count
        )
        return None

    sources_used = data.get("sources_used") or []
    if not sources_used:
        sources_used = [{"title": item.get("source_name") or item["link"], "url": item["link"]}]

    return {
        "title": data["title"],
        "slug": slugify(data["title"]),
        "category": item["category"],
        "excerpt": data["excerpt"],
        "body_markdown": data["body_markdown"],
        "sources_used": sources_used,
        "risk": config.risk_for_category(item["category"]),
        "source_link": item["link"],
    }


def write_selected(selected: dict) -> list:
    """Escreve um artigo por item selecionado e salva o rascunho no banco
    (status 'drafted' + draft_json) — não publica nada, isso é responsabilidade
    de pipeline/publish.py. Devolve a lista de rascunhos gerados com sucesso."""
    client = _client()
    drafts = []

    with db.connect() as conn:
        if config.WEEKLY_TOKEN_CEILING is not None:
            used = db.tokens_used_this_week(conn)
            if used >= config.WEEKLY_TOKEN_CEILING:
                logger.warning(
                    "Teto semanal de tokens já atingido (%d >= %d) — pulando redação nesta execução.",
                    used,
                    config.WEEKLY_TOKEN_CEILING,
                )
                return drafts

        for items in selected.values():
            for item in items:
                draft = write_article(client, conn, item)
                if draft is None:
                    db.mark_draft_failed(conn, item["link"])
                    continue
                db.save_draft(conn, item["link"], draft)
                drafts.append(draft)

    return drafts
