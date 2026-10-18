"""Testa só o parsing da resposta da Anthropic (classify_item/write_article),
simulando o client com um dublê — nunca chama a API de verdade, então não
gasta tokens nem precisa de ANTHROPIC_API_KEY pra rodar."""
import json
from types import SimpleNamespace

from pipeline import classify, write


def _fake_response(text: str, input_tokens=10, output_tokens=10):
    return SimpleNamespace(
        content=[SimpleNamespace(type="text", text=text)],
        usage=SimpleNamespace(input_tokens=input_tokens, output_tokens=output_tokens),
    )


class _FakeMessages:
    def __init__(self, response):
        self._response = response

    def create(self, **kwargs):
        return self._response


class _FakeClient:
    def __init__(self, response):
        self.messages = _FakeMessages(response)


def test_classify_item_le_categoria_e_relevancia_da_resposta(db_module):
    fake_client = _FakeClient(_fake_response(json.dumps({"category": "ansiedade", "relevance": 8})))
    item = {"category": "sono", "title": "Título", "summary": "Resumo"}

    with db_module.connect() as conn:
        result = classify.classify_item(fake_client, conn, item)

    assert result == ("ansiedade", 8)


def test_classify_item_cai_pra_categoria_original_se_a_ia_devolver_categoria_invalida(db_module):
    fake_client = _FakeClient(_fake_response(json.dumps({"category": "categoria-que-nao-existe", "relevance": 5})))
    item = {"category": "produtividade", "title": "Título", "summary": "Resumo"}

    with db_module.connect() as conn:
        result = classify.classify_item(fake_client, conn, item)

    assert result == ("produtividade", 5)


def test_classify_item_devolve_none_se_a_resposta_nao_for_json(db_module):
    fake_client = _FakeClient(_fake_response("isso não é JSON"))
    item = {"category": "sono", "title": "Título", "summary": "Resumo"}

    with db_module.connect() as conn:
        result = classify.classify_item(fake_client, conn, item)

    assert result is None


def test_write_article_monta_o_rascunho_a_partir_da_resposta(db_module):
    body = " ".join(["palavra"] * 650)
    payload = {
        "title": "Um Título De Teste",
        "excerpt": "Resumo de teste.",
        "body_markdown": body,
        "sources_used": [{"title": "Fonte X", "url": "https://exemplo.com/fonte"}],
    }
    fake_client = _FakeClient(_fake_response(json.dumps(payload)))
    item = {
        "category": "produtividade",
        "title": "Item original",
        "summary": "Resumo",
        "link": "https://exemplo.com/item-original",
        "source_name": "Fonte X",
    }

    with db_module.connect() as conn:
        draft = write.write_article(fake_client, conn, item)

    assert draft is not None
    assert draft["title"] == "Um Título De Teste"
    assert draft["slug"] == "um-titulo-de-teste"
    assert draft["risk"] == "baixo"
    assert draft["sources_used"] == payload["sources_used"]


def test_write_article_descarta_artigo_curto_demais(db_module):
    payload = {
        "title": "Título",
        "excerpt": "Resumo.",
        "body_markdown": "muito curto",
        "sources_used": [],
    }
    fake_client = _FakeClient(_fake_response(json.dumps(payload)))
    item = {
        "category": "sono",
        "title": "Item original",
        "summary": "Resumo",
        "link": "https://exemplo.com/item-curto",
        "source_name": "Fonte X",
    }

    with db_module.connect() as conn:
        draft = write.write_article(fake_client, conn, item)

    assert draft is None


def test_classify_item_aceita_json_em_bloco_de_codigo_markdown(db_module):
    # Formato real devolvido pelo Haiku na execução de 2026-10-18.
    fake_client = _FakeClient(_fake_response('```json\n{"category": "pausa", "relevance": 9}\n```'))
    item = {"category": "pausa", "title": "Why Can't We Rest Anymore?", "summary": "Resumo"}

    with db_module.connect() as conn:
        result = classify.classify_item(fake_client, conn, item)

    assert result == ("pausa", 9)


def test_classify_item_aceita_frase_antes_do_json(db_module):
    fake_client = _FakeClient(_fake_response('Aqui está:\n{"category": "sono", "relevance": 7}'))
    item = {"category": "sono", "title": "Título", "summary": "Resumo"}

    with db_module.connect() as conn:
        result = classify.classify_item(fake_client, conn, item)

    assert result == ("sono", 7)


def test_classify_item_devolve_none_se_json_nao_for_objeto(db_module):
    fake_client = _FakeClient(_fake_response("[1, 2]"))
    item = {"category": "sono", "title": "Título", "summary": "Resumo"}

    with db_module.connect() as conn:
        assert classify.classify_item(fake_client, conn, item) is None
