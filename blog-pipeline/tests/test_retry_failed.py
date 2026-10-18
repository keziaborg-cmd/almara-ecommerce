"""Item com classificação falhada volta pra fila (por um tempo), em vez de ficar perdido."""
from datetime import datetime, timedelta, timezone


def _insert(db_module, conn, link, status, collected_at):
    db_module.insert_item(
        conn, title=link, link=link, published_at=None, summary="", category="sono", source_name="x"
    )
    conn.execute(
        "UPDATE items SET status = ?, collected_at = ? WHERE id = ?",
        (status, collected_at.isoformat(), db_module.item_id(link)),
    )


def test_item_que_falhou_recentemente_volta_pra_fila(db_module):
    now = datetime.now(timezone.utc)
    with db_module.connect() as conn:
        _insert(db_module, conn, "https://a/novo", "collected", now)
        _insert(db_module, conn, "https://a/falhou-ontem", "classify_failed", now - timedelta(days=1))
        _insert(db_module, conn, "https://a/falhou-ha-um-mes", "classify_failed", now - timedelta(days=30))
        _insert(db_module, conn, "https://a/ja-classificado", "classified", now)
        links = sorted(i["link"] for i in db_module.items_pending_classification(conn))

    assert links == ["https://a/falhou-ontem", "https://a/novo"]
