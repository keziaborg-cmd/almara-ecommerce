import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    published_at TEXT,
    summary TEXT,
    category TEXT NOT NULL,
    source_name TEXT,
    collected_at TEXT NOT NULL,
    relevance_score INTEGER,
    status TEXT NOT NULL DEFAULT 'collected',
    draft_json TEXT
);

CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at TEXT NOT NULL,
    stage TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL
);
"""


def item_id(link: str) -> str:
    """Chave de deduplicação — hash do link, não do título. O título de um
    mesmo item às vezes varia levemente entre coletas (ex.: feed atualiza um
    typo); o link é o identificador estável."""
    return hashlib.sha256(link.strip().encode("utf-8")).hexdigest()


@contextmanager
def connect():
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        conn.executescript(SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def already_seen(conn, link: str) -> bool:
    row = conn.execute("SELECT 1 FROM items WHERE id = ?", (item_id(link),)).fetchone()
    return row is not None


def insert_item(conn, *, title, link, published_at, summary, category, source_name):
    conn.execute(
        """INSERT OR IGNORE INTO items
           (id, title, link, published_at, summary, category, source_name, collected_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'collected')""",
        (
            item_id(link),
            title,
            link,
            published_at,
            summary,
            category,
            source_name,
            datetime.now(timezone.utc).isoformat(),
        ),
    )


# Item que falhou na classificação (API fora, resposta ilegível) volta pra fila por esse
# tempo; depois disso desiste, pra não pagar classificação de item velho pra sempre.
RETRY_FAILED_DAYS = 14


def items_pending_classification(conn):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=RETRY_FAILED_DAYS)).isoformat()
    rows = conn.execute(
        """SELECT * FROM items
           WHERE status = 'collected'
              OR (status = 'classify_failed' AND collected_at >= ?)""",
        (cutoff,),
    ).fetchall()
    return [dict(r) for r in rows]


def update_classification(conn, link: str, *, category: str, relevance: int, status: str):
    conn.execute(
        "UPDATE items SET category = ?, relevance_score = ?, status = ? WHERE id = ?",
        (category, relevance, status, item_id(link)),
    )


def mark_classification_failed(conn, link: str):
    conn.execute("UPDATE items SET status = 'classify_failed' WHERE id = ?", (item_id(link),))


def top_items_by_category(conn, category: str, limit: int):
    rows = conn.execute(
        """SELECT * FROM items
           WHERE category = ? AND status = 'classified'
           ORDER BY relevance_score DESC
           LIMIT ?""",
        (category, limit),
    ).fetchall()
    return [dict(r) for r in rows]


def discard_item(conn, link: str):
    conn.execute("UPDATE items SET status = 'discarded' WHERE id = ?", (item_id(link),))


def save_draft(conn, link: str, draft: dict):
    conn.execute(
        "UPDATE items SET status = 'drafted', draft_json = ? WHERE id = ?",
        (json.dumps(draft, ensure_ascii=False), item_id(link)),
    )


def mark_draft_failed(conn, link: str):
    conn.execute("UPDATE items SET status = 'write_failed' WHERE id = ?", (item_id(link),))


def get_drafted_items(conn):
    rows = conn.execute("SELECT draft_json FROM items WHERE status = 'drafted' AND draft_json IS NOT NULL").fetchall()
    return [json.loads(r["draft_json"]) for r in rows]


def mark_published(conn, link: str):
    conn.execute("UPDATE items SET status = 'published' WHERE id = ?", (item_id(link),))


def log_token_usage(conn, stage: str, input_tokens: int, output_tokens: int):
    conn.execute(
        "INSERT INTO token_usage (run_at, stage, input_tokens, output_tokens) VALUES (?, ?, ?, ?)",
        (datetime.now(timezone.utc).isoformat(), stage, input_tokens, output_tokens),
    )


def tokens_used_this_week(conn) -> int:
    row = conn.execute(
        """SELECT COALESCE(SUM(input_tokens + output_tokens), 0) AS total
           FROM token_usage
           WHERE run_at >= datetime('now', '-7 days')"""
    ).fetchone()
    return row["total"]
