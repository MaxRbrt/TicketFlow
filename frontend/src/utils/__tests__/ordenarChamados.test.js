// Testes da ordenacao de chamados (funcoes puras, nao mutam a entrada).
import { describe, it, expect } from "vitest";
import {
  ordenarPorMaisRecente,
  ordenarPorMaisAntigo,
  ordenarPorPrioridade,
} from "../ordenarChamados.js";
import { PRIORIDADE } from "../../constantes/prioridadesChamado.js";

// Datas ISO em ordem crescente para montar chamados de teste.
const ANTIGO = "2026-01-01T10:00:00.000Z";
const MEIO = "2026-03-01T10:00:00.000Z";
const RECENTE = "2026-06-01T10:00:00.000Z";

function chamado(id, createdAt, priority = PRIORIDADE.MEDIA) {
  return { id, createdAt, priority };
}

describe("ordenarPorMaisRecente", () => {
  it("ordena do mais recente para o mais antigo", () => {
    const lista = [chamado("a", ANTIGO), chamado("c", RECENTE), chamado("b", MEIO)];
    expect(ordenarPorMaisRecente(lista).map((c) => c.id)).toEqual(["c", "b", "a"]);
  });

  it("nao muta o array original", () => {
    const lista = [chamado("a", ANTIGO), chamado("c", RECENTE)];
    const copia = [...lista];
    ordenarPorMaisRecente(lista);
    expect(lista).toEqual(copia);
  });

  it("trata lista vazia e ausente", () => {
    expect(ordenarPorMaisRecente([])).toEqual([]);
    expect(ordenarPorMaisRecente()).toEqual([]);
  });

  it("manda datas invalidas/ausentes para o fim", () => {
    const lista = [chamado("semData", null), chamado("c", RECENTE)];
    expect(ordenarPorMaisRecente(lista).map((c) => c.id)).toEqual(["c", "semData"]);
  });
});

describe("ordenarPorMaisAntigo", () => {
  it("ordena do mais antigo para o mais recente", () => {
    const lista = [chamado("c", RECENTE), chamado("a", ANTIGO), chamado("b", MEIO)];
    expect(ordenarPorMaisAntigo(lista).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
});

describe("ordenarPorPrioridade", () => {
  it("coloca a prioridade mais alta primeiro", () => {
    const lista = [
      chamado("baixa", MEIO, PRIORIDADE.BAIXA),
      chamado("urgente", MEIO, PRIORIDADE.URGENTE),
      chamado("media", MEIO, PRIORIDADE.MEDIA),
      chamado("alta", MEIO, PRIORIDADE.ALTA),
    ];
    expect(ordenarPorPrioridade(lista).map((c) => c.id)).toEqual([
      "urgente",
      "alta",
      "media",
      "baixa",
    ]);
  });

  it("desempata pela data mais recente", () => {
    const lista = [
      chamado("antigo", ANTIGO, PRIORIDADE.URGENTE),
      chamado("recente", RECENTE, PRIORIDADE.URGENTE),
    ];
    expect(ordenarPorPrioridade(lista).map((c) => c.id)).toEqual(["recente", "antigo"]);
  });
});
