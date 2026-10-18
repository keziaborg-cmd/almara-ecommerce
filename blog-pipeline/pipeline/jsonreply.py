"""Leitura do JSON que o modelo devolve. Mesmo pedindo "só JSON", às vezes a resposta vem
embrulhada em bloco de código markdown (```json ... ```) ou com uma frase antes/depois —
json.loads direto descartava tudo (a execução de 2026-10-18 classificou 0 de 84 itens)."""
import json
import re

_FENCE = re.compile(r"^\s*```(?:json)?\s*\n?(.*?)\n?\s*```\s*$", re.S | re.I)


def parse_json_object(text: str) -> dict:
    """Devolve o objeto JSON da resposta. Levanta json.JSONDecodeError (ou ValueError, se
    vier JSON que não é objeto) quando não há um objeto legível."""
    candidate = text.strip()
    fenced = _FENCE.match(candidate)
    if fenced:
        candidate = fenced.group(1).strip()
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError:
        start, end = candidate.find("{"), candidate.rfind("}")
        if start == -1 or end <= start:
            raise
        data = json.loads(candidate[start : end + 1])
    if not isinstance(data, dict):
        raise ValueError("a resposta é JSON, mas não é um objeto")
    return data
