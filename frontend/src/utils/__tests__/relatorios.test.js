// Testes das agregacoes de relatorios (funcoes puras).
import { describe, it, expect } from "vitest";
import {
  filtrarPorPeriodo,
  volumePorPeriodo,
  agruparPorSetor,
  tempoMedioResolucao,
  taxaResolucao,
  topSolicitantes,
  formatarDuracao,
} from "../relatorios.js";

// "Agora" fixo (local time) para tornar os limites de periodo deterministicos.
const AGORA = new Date("2026-06-15T12:00:00");

const HORA = 3600000;
const DIA = 24 * HORA;

function t(over = {}) {
  return {
    id: over.id || Math.random().toString(36).slice(2),
    status: over.status || "open",
    // "location" in over preserva null/"" passados de proposito (o ?? converteria
    // null para o default, escondendo a normalizacao testada).
    location: "location" in over ? over.location : "TI",
    requesterId: over.requesterId || "u1",
    requesterName: over.requesterName || "Ana",
    createdAt: over.createdAt || "2026-06-10T09:00:00",
    resolvedAt: over.resolvedAt ?? null,
  };
}

describe("filtrarPorPeriodo", () => {
  const lista = [
    t({ id: "mai", createdAt: "2026-05-20T10:00:00" }),
    t({ id: "fev", createdAt: "2026-02-01T10:00:00" }),
    t({ id: "jun", createdAt: "2026-06-10T10:00:00" }),
    t({ id: "jan", createdAt: "2026-01-05T10:00:00" }),
  ];

  it("'mes' pega so o mes atual", () => {
    expect(filtrarPorPeriodo(lista, "mes", AGORA).map((c) => c.id)).toEqual(["jun"]);
  });

  it("'trimestre' pega os ultimos 3 meses", () => {
    const ids = filtrarPorPeriodo(lista, "trimestre", AGORA).map((c) => c.id).sort();
    expect(ids).toEqual(["jun", "mai"]); // mar 15 -> abr/mai/jun; fev e jan ficam fora
  });

  it("'ano' pega desde 1 de janeiro", () => {
    const ids = filtrarPorPeriodo(lista, "ano", AGORA).map((c) => c.id).sort();
    expect(ids).toEqual(["fev", "jan", "jun", "mai"]);
  });

  it("'tudo' retorna todos e nao muta", () => {
    const copia = [...lista];
    expect(filtrarPorPeriodo(lista, "tudo", AGORA)).toHaveLength(4);
    expect(lista).toEqual(copia);
  });
});

describe("volumePorPeriodo", () => {
  it("'mes' agrupa por dia com buckets continuos", () => {
    const lista = [
      t({ createdAt: "2026-06-10T09:00:00" }),
      t({ createdAt: "2026-06-10T18:00:00" }),
      t({ createdAt: "2026-06-12T08:00:00" }),
    ];
    const { labels, data } = volumePorPeriodo(lista, "mes", AGORA);
    expect(labels).toHaveLength(15); // dias 01..15
    expect(labels[0]).toBe("01/06");
    expect(data[labels.indexOf("10/06")]).toBe(2);
    expect(data[labels.indexOf("12/06")]).toBe(1);
    expect(data[labels.indexOf("11/06")]).toBe(0);
  });

  it("'ano' agrupa por mes", () => {
    const lista = [
      t({ createdAt: "2026-03-02T09:00:00" }),
      t({ createdAt: "2026-06-01T09:00:00" }),
    ];
    const { labels, data } = volumePorPeriodo(lista, "ano", AGORA);
    expect(labels).toEqual(["jan/26", "fev/26", "mar/26", "abr/26", "mai/26", "jun/26"]);
    expect(data[labels.indexOf("mar/26")]).toBe(1);
    expect(data[labels.indexOf("jun/26")]).toBe(1);
    expect(data[labels.indexOf("jan/26")]).toBe(0);
  });
});

describe("agruparPorSetor", () => {
  it("normaliza vazio para 'Nao informado'", () => {
    const { labels } = agruparPorSetor([t({ location: "" }), t({ location: null })]);
    expect(labels).toEqual(["Nao informado"]);
  });

  it("mantem top N e agrega o resto em 'Outros'", () => {
    const lista = [
      ...Array(5).fill(0).map(() => t({ location: "A" })),
      ...Array(3).fill(0).map(() => t({ location: "B" })),
      t({ location: "C" }),
      t({ location: "D" }),
      t({ location: "E" }),
      t({ location: "F" }),
    ];
    const { labels, data } = agruparPorSetor(lista, 2);
    expect(labels).toEqual(["A", "B", "Outros"]);
    expect(data).toEqual([5, 3, 4]); // C+D+E+F
  });
});

describe("tempoMedioResolucao", () => {
  it("media sobre resolvidos com resolvedAt valido", () => {
    const lista = [
      t({ status: "resolved", createdAt: "2026-06-01T00:00:00", resolvedAt: "2026-06-03T00:00:00" }), // 2 dias
      t({ status: "resolved", createdAt: "2026-06-01T00:00:00", resolvedAt: "2026-06-05T00:00:00" }), // 4 dias
      t({ status: "resolved", createdAt: "2026-06-01T00:00:00", resolvedAt: null }), // ignorado
      t({ status: "open" }), // ignorado
    ];
    const r = tempoMedioResolucao(lista);
    expect(r.quantidade).toBe(2);
    expect(r.ms).toBe(3 * DIA);
  });

  it("ms null quando nao ha resolvidos validos", () => {
    expect(tempoMedioResolucao([t({ status: "open" })]).ms).toBeNull();
  });
});

describe("taxaResolucao", () => {
  it("calcula percentual, backlog e total", () => {
    const lista = [
      t({ status: "resolved" }),
      t({ status: "resolved" }),
      t({ status: "open" }),
      t({ status: "in_progress" }),
      t({ status: "cancelled" }),
    ];
    const r = taxaResolucao(lista);
    expect(r.total).toBe(5);
    expect(r.resolvidos).toBe(2);
    expect(r.percentual).toBe(40);
    expect(r.backlog).toBe(2); // open + in_progress (cancelled nao conta)
  });

  it("total 0 -> percentual 0", () => {
    expect(taxaResolucao([]).percentual).toBe(0);
  });
});

describe("topSolicitantes", () => {
  it("agrupa por requesterId e ordena desc", () => {
    const lista = [
      t({ requesterId: "a", requesterName: "Ana" }),
      t({ requesterId: "a", requesterName: "Ana" }),
      t({ requesterId: "b", requesterName: "Bruno" }),
    ];
    const r = topSolicitantes(lista, 5);
    expect(r[0]).toMatchObject({ id: "a", nome: "Ana", quantidade: 2 });
    expect(r[1]).toMatchObject({ id: "b", quantidade: 1 });
  });
});

describe("formatarDuracao", () => {
  it("null -> tracinho", () => {
    expect(formatarDuracao(null)).toBe("—");
  });
  it("abaixo de 1 dia em horas", () => {
    expect(formatarDuracao(5 * HORA)).toBe("5 h");
  });
  it("1 dia ou mais em dias com virgula", () => {
    expect(formatarDuracao(2.4 * DIA)).toBe("2,4 dias");
  });
});
