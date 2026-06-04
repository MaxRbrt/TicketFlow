// Testes da normalizacao/formatacao de datas.
import { describe, it, expect } from "vitest";
import {
  paraData,
  formatarData,
  formatarDataHora,
  formatarDataRelativa,
} from "../formatarData.js";

describe("paraData", () => {
  it("converte Firestore Timestamp (objeto com toDate)", () => {
    const alvo = new Date("2026-06-01T10:00:00.000Z");
    const timestampFake = { toDate: () => alvo };
    expect(paraData(timestampFake)).toBe(alvo);
  });

  it("aceita Date valido e rejeita Date invalido", () => {
    const d = new Date("2026-06-01T10:00:00.000Z");
    expect(paraData(d)).toBe(d);
    expect(paraData(new Date("data-invalida"))).toBeNull();
  });

  it("aceita string ISO e numero epoch", () => {
    expect(paraData("2026-06-01T10:00:00.000Z")).toBeInstanceOf(Date);
    expect(paraData(1748772000000)).toBeInstanceOf(Date);
  });

  it("retorna null para valores vazios/invalidos", () => {
    expect(paraData(null)).toBeNull();
    expect(paraData(undefined)).toBeNull();
    expect(paraData("")).toBeNull();
    expect(paraData("texto qualquer")).toBeNull();
  });
});

describe("formatarData", () => {
  it("formata como dd/mm/aaaa", () => {
    // Usa meio-dia UTC para evitar virada de dia por fuso.
    expect(formatarData("2026-06-01T12:00:00.000Z")).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("usa o fallback quando a data e invalida", () => {
    expect(formatarData(null)).toBe("-");
    expect(formatarData(null, "sem data")).toBe("sem data");
  });
});

describe("formatarDataHora", () => {
  it("inclui hora e minuto", () => {
    expect(formatarDataHora("2026-06-01T12:30:00.000Z")).toMatch(
      /\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/
    );
  });

  it("usa o fallback quando invalida", () => {
    expect(formatarDataHora(undefined)).toBe("-");
  });
});

describe("formatarDataRelativa", () => {
  it("'agora mesmo' para segundos", () => {
    expect(formatarDataRelativa(new Date(Date.now() - 5 * 1000))).toBe("agora mesmo");
  });

  it("minutos no singular e plural", () => {
    expect(formatarDataRelativa(new Date(Date.now() - 60 * 1000))).toBe("ha 1 minuto");
    expect(formatarDataRelativa(new Date(Date.now() - 5 * 60 * 1000))).toBe("ha 5 minutos");
  });

  it("horas e dias", () => {
    expect(formatarDataRelativa(new Date(Date.now() - 2 * 60 * 60 * 1000))).toBe("ha 2 horas");
    expect(formatarDataRelativa(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))).toBe("ha 3 dias");
  });

  it("cai para data absoluta acima de ~30 dias", () => {
    const muitoAntigo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(formatarDataRelativa(muitoAntigo)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("usa o fallback quando invalida", () => {
    expect(formatarDataRelativa(null)).toBe("-");
  });
});
