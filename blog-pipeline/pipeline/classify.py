import json
import logging

from anthropic import Anthropic

from . import config, db
from .jsonreply import parse_json_object
from .prompts import CLASSIFY_SYSTEM_PROMPT

logger = logging.getLogger("blog_pipeline.classify")


def _client() -> Anthropic:
    return Anthropic(api_key=config.require_api_key())


def _extract_text(response) -> str:
    return "".join(block.text for block in response.content if block.type == "text")


def classify_item(client: Anthropic, conn, item: dict):
    """Devolve (category, relevance) ou None se a classificação falhar —
    nunca lança, pra uma fonte/item problemático não derrubar a execução."""
    prompt = (
        f"Categoria original: {item['category']}\n"
        f"Título: {item['title']}\n"
        f"Resumo: {item['summary'][:800]}\n"
    )
    try:
        response = client.messages.create(
            model=config.CLASSIFY_MODEL,
            max_tokens=200,
            system=CLASSIFY_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as exc:
        logger.warning("Falha ao classificar '%s': %s", item["title"], exc)
        return None

    db.log_token_usage(conn, "classify", response.usage.input_tokens, response.usage.output_tokens)

    text = _extract_text(response)
    try:
        data = parse_json_object(text)
        category = data["category"]
        relevance = int(data["relevance"])
    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as exc:
        logger.warning("Resposta de classificação inesperada pra '%s': %r (%s)", item["title"], text, exc)
        return None

    if category not in config.CATEGORIES:
        category = item["category"]
    relevance = max(0, min(10, relevance))

    return category, relevance


def classify_pending() -> int:
    """Classifica todos os itens pendentes. Devolve quantos foram classificados com sucesso."""
    client = _client()
    classified_count = 0

    with db.connect() as conn:
        if config.WEEKLY_TOKEN_CEILING is not None:
            used = db.tokens_used_this_week(conn)
            if used >= config.WEEKLY_TOKEN_CEILING:
                logger.warning(
                    "Teto semanal de tokens já atingido (%d >= %d) — pulando classificação nesta execução.",
                    used,
                    config.WEEKLY_TOKEN_CEILING,
                )
                return 0

        pending = db.items_pending_classification(conn)
        logger.info("%d item(ns) pendente(s) de classificação.", len(pending))

        for item in pending:
            result = classify_item(client, conn, item)
            if result is None:
                db.mark_classification_failed(conn, item["link"])
                continue
            category, relevance = result
            db.update_classification(conn, item["link"], category=category, relevance=relevance, status="classified")
            classified_count += 1

    return classified_count


def select_top_items() -> dict:
    """Mantém só os TOP_N_PER_CATEGORY itens de maior relevância por
    categoria; marca o restante dos itens já classificados como descartado."""
    selected: dict[str, list[dict]] = {}

    with db.connect() as conn:
        for category in config.CATEGORIES:
            top = db.top_items_by_category(conn, category, config.TOP_N_PER_CATEGORY)
            selected[category] = top
            kept_links = {item["link"] for item in top}

            all_classified = conn.execute(
                "SELECT link FROM items WHERE category = ? AND status = 'classified'", (category,)
            ).fetchall()
            for row in all_classified:
                if row["link"] not in kept_links:
                    db.discard_item(conn, row["link"])

    return selected
