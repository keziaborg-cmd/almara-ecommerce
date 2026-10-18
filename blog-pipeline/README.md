# Pipeline de rascunhos do blog — Almara

Projeto Python separado, dentro do repo do site, que gera **rascunhos** de artigo pro
blog a partir de fontes externas (feeds RSS), usando a API da Anthropic pra classificar
relevância e escrever o texto. Os rascunhos entram direto na tabela `public.blog_posts`
(Supabase) — o mesmo banco que o site lê.

**Nenhum artigo é publicado automaticamente.** Todo artigo nasce com
`status = 'revisao'` — RLS garante isso (o role do pipeline só consegue inserir nesse
status, ver `supabase/migrations/20261006000000_blog_posts.sql`) e o site só lê
`status = 'publicado'`. A revisão e a publicação acontecem no painel almara-metrics
(aba "Blog"), nunca aqui.

## As 4 etapas

1. **Coleta** (`pipeline/collect.py`) — lê `sources.yaml`, busca os itens novos (dos
   últimos 7 dias) de cada feed RSS e grava no SQLite (`data/pipeline.sqlite3`), pra
   nunca processar o mesmo item duas vezes.
2. **Classificação** (`pipeline/classify.py`) — usa `claude-haiku-4-5-20251001` pra
   confirmar a categoria e dar uma nota de relevância (0 a 10) pra cada item pendente.
   Depois, mantém só os 5 melhores por categoria.
3. **Redação** (`pipeline/write.py`) — usa `claude-sonnet-5-5` pra escrever um artigo
   original (600 a 900 palavras) por item selecionado, seguindo as regras de marca e
   segurança do prompt de sistema (`pipeline/prompts.py`).
4. **Publicação** (`pipeline/publish.py`) — insere um post por rascunho em
   `public.blog_posts`, sempre em `status = 'revisao'`, usando a connection string do
   role `blog_pipeline_writer` (só INSERT, só enxerga a coluna `slug` de uma linha já
   existente — pra evitar colisão de slug, nunca pra ler o conteúdo de um rascunho
   alheio).

## Como rodar

```bash
cd blog-pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt       # ou requirements-dev.txt, pra rodar os testes também
cp .env.example .env                  # preenche ANTHROPIC_API_KEY e o resto
python run.py                         # roda tudo: coleta -> classifica -> escreve -> publica
```

Rodar uma etapa por vez (cada uma lê/grava o próprio estado no SQLite, então dá pra
rodar em execuções separadas):

```bash
python run.py --stage collect
python run.py --stage classify
python run.py --stage write
python run.py --stage publish
```

`--dry-run` roda tudo, mas não insere nada de verdade em `blog_posts` — só mostra no
log o que seria feito. Útil pra testar sem gastar uma linha real.

`-v` liga log em nível debug.

**Atenção ao rodar `publish` localmente**: o comando insere direto na tabela
`public.blog_posts` do projeto Supabase compartilhado (mesmo banco de produção, não há
banco de teste separado) — precisa de `BLOG_DATABASE_URL` configurada no `.env` (ver
`.env.example`), com a connection string do role `blog_pipeline_writer`.

## Configurando as fontes (`sources.yaml`)

O arquivo já vem com um exemplo de estrutura por categoria (`sono`, `ansiedade`,
`produtividade`, `pausa`). Substitua pelas fontes reais que você escolheu.

**Importante — só `type: rss` funciona nesta versão.** Uma fonte `type: page` (uma
página de site sem feed) fica registrada no arquivo, mas o coletor só loga que ela
existe e pula, sem tentar extrair conteúdo dela — fazer scraping genérico de HTML de
forma confiável varia demais de site pra site pra valer a pena uma implementação única
que "mais ou menos" funciona em todos. Pra usar uma fonte dessas de verdade:
- procure se o site tem um feed RSS em um caminho não óbvio (`/feed`, `/rss`, `/rss.xml`
  costumam funcionar mesmo sem link visível na página), ou
- peça pra implementar um parser específico pra esse site.

Alguns sites bloqueiam acesso automatizado com um desafio tipo Cloudflare ("Just a
moment...") mesmo em URLs de feed — isso não tem contorno dentro deste projeto (seria
evasão de proteção antibot), então essas fontes simplesmente não vão funcionar aqui.
Prefira um feed de uma fonte sem esse tipo de proteção.

## Classificação de risco

- `risco: alto` — categorias `sono`, `ansiedade` e `pausa`. O painel almara-metrics já
  sinaliza isso na tela de revisão, pedindo revisão de um profissional antes de
  publicar, não só da Kezia.
- `risco: baixo` — categoria `produtividade`. Pode ser revisado só pela Kezia.

Nenhum nível de risco pula a revisão humana — a diferença é só quem precisa revisar.

## Custo e segurança

- A chave da API (`ANTHROPIC_API_KEY`) só vem de variável de ambiente — nunca aparece
  no código nem é commitada (o `.env` está no `.gitignore` do repo).
- `WEEKLY_TOKEN_CEILING` (opcional, em `.env` ou nas variáveis do GitHub Actions) define
  um teto de tokens (entrada + saída somados) por semana corrida. Se o teto já foi
  atingido, a etapa de classificação ou redação simplesmente não chama a API de novo
  nessa execução — registra isso no log, não derruba o processo.
- Todo token usado fica registrado na tabela `token_usage` do SQLite, com a etapa e o
  horário — dá pra consultar quanto foi gasto em qualquer janela de tempo.
- Erros de rede, de feed malformado ou de resposta inesperada da API nunca derrubam a
  execução inteira — cada falha vira um log de aviso específico e o pipeline segue pra
  próxima fonte/item.

## Execução agendada (GitHub Actions)

`.github/workflows/blog-pipeline.yml` (na raiz do repo do site) roda o pipeline toda
segunda-feira. Dá pra disparar manualmente também, pela aba Actions do GitHub
("Run workflow"), com a opção de rodar em modo `--dry-run`.

Secrets/variáveis que esse workflow espera, configurados em Settings → Secrets and
variables → Actions do repositório:

| Nome | Tipo | Obrigatório |
|---|---|---|
| `ANTHROPIC_API_KEY` | Secret | Sim |
| `BLOG_DATABASE_URL` | Secret | Sim (pra publicar — connection string do role `blog_pipeline_writer`) |
| `WEEKLY_TOKEN_CEILING` | Variable | Não (sem teto se ausente) |

`GITHUB_TOKEN` já vem automático, não precisa configurar.

A deduplicação entre execuções agendadas depende do cache do `actions/cache` (ver
comentário no próprio workflow) — se o workflow ficar muito tempo sem rodar (~7 dias
sem acesso ao cache), esse estado pode se perder; o pior cenário é reprocessar um item
já publicado antes, não pular revisão.

## Revisando e publicando um rascunho

1. O post entra na aba "Blog" do painel almara-metrics assim que o pipeline roda,
   listado em "Aguardando revisão" — com categoria, risco, fontes e o corpo completo.
2. Leia o artigo. Se o risco for alto, peça revisão de um profissional antes de seguir.
3. Clique em "Publicar". O post vira `status = 'publicado'` na hora — não existe edição
   de texto pelo painel nesta fase; pra corrigir algo antes de publicar, edite direto na
   tabela (SQL Editor do Supabase) ou peça pra reescrever.
4. O artigo aparece no site sozinho em até 15 minutos (o blog e o sitemap se refazem a
   cada 15 min — `revalidate = 900`), sem precisar de deploy.

## Testes

```bash
cd blog-pipeline
source .venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest -v
```

Os testes nunca chamam a API da Anthropic nem o Postgres de verdade (gastam zero
tokens, não tocam no banco compartilhado) — a classificação, a redação e o insert em
`blog_posts` são testados simulando a resposta do client/cursor. Cobrem: deduplicação
de itens (o requisito explícito), parsing da resposta da IA, geração de slug,
mapeamento de risco por categoria, geração de slug único (sem colisão) e o insert feito
pelo publisher — sempre em `status = 'revisao'`, com isolamento de falha por rascunho.
