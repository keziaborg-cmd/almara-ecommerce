import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCES_PATH = BASE_DIR / "sources.yaml"

# Pode ser sobrescrito por variável de ambiente (ver tests/, que apontam pra
# um arquivo temporário em vez do banco real).
DB_PATH = Path(os.environ.get("BLOG_PIPELINE_DB_PATH", BASE_DIR / "data" / "pipeline.sqlite3"))

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

# Modelos: Haiku 4.5 classifica (rápido e barato); Sonnet 5.5, o Sonnet atual, escreve.
CLASSIFY_MODEL = "claude-haiku-4-5-20251001"
WRITE_MODEL = "claude-sonnet-5-5"

TOP_N_PER_CATEGORY = 5
COLLECT_WINDOW_DAYS = 7
MIN_WORDS = 300  # abaixo disso o artigo é descartado, não publicado (ver pipeline/write.py)

CATEGORIES = ["sono", "ansiedade", "produtividade", "pausa"]
# "pausa" é o nome público da jornada cujo slug interno é "compulsividade"
# (ver data/blog-categories.ts e data/journeys.ts no site) — tratado aqui só
# como mais uma categoria de risco alto, sem precisar saber desse detalhe.
HIGH_RISK_CATEGORIES = {"sono", "ansiedade", "pausa"}

_ceiling = os.environ.get("WEEKLY_TOKEN_CEILING")
WEEKLY_TOKEN_CEILING = int(_ceiling) if _ceiling else None

# Connection string do role blog_pipeline_writer (só INSERT, sempre em status "revisao" — ver
# almara-ecommerce/supabase/migrations/20261006000000_blog_posts.sql). A revisão e a publicação
# de verdade acontecem no painel almara-metrics, não aqui.
BLOG_DATABASE_URL = os.environ.get("BLOG_DATABASE_URL")


def risk_for_category(category: str) -> str:
    return "alto" if category in HIGH_RISK_CATEGORIES else "baixo"


def require_api_key() -> str:
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente "
            "(.env local ou secret do GitHub Actions) — nunca coloque a chave "
            "direto no código nem no repositório."
        )
    return ANTHROPIC_API_KEY


def require_blog_database_url() -> str:
    if not BLOG_DATABASE_URL:
        raise RuntimeError(
            "BLOG_DATABASE_URL não configurada. Defina a variável de ambiente (.env local ou "
            "secret do GitHub Actions) com a connection string do role blog_pipeline_writer — "
            "nunca coloque a senha direto no código nem no repositório."
        )
    return BLOG_DATABASE_URL
