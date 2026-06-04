// Testes das validacoes de formulario (puras). Rodar com `npm test`.
import { describe, it, expect } from "vitest";
import {
  emailValido,
  senhaValida,
  campoPreenchido,
  senhasIguais,
  TAMANHO_MINIMO_SENHA,
} from "../validarEmail.js";

describe("emailValido", () => {
  it("aceita e-mails bem formados", () => {
    expect(emailValido("voce@exemplo.com")).toBe(true);
    expect(emailValido("a.b-c@dominio.com.br")).toBe(true);
  });

  it("ignora espacos nas pontas", () => {
    expect(emailValido("  voce@exemplo.com  ")).toBe(true);
  });

  it("rejeita formatos invalidos", () => {
    expect(emailValido("sem-arroba")).toBe(false);
    expect(emailValido("sem@dominio")).toBe(false);
    expect(emailValido("com espaco@x.com")).toBe(false);
    expect(emailValido("")).toBe(false);
  });

  it("rejeita valores que nao sao string", () => {
    expect(emailValido(null)).toBe(false);
    expect(emailValido(undefined)).toBe(false);
    expect(emailValido(123)).toBe(false);
  });
});

describe("senhaValida", () => {
  it("exige o tamanho minimo", () => {
    expect(senhaValida("a".repeat(TAMANHO_MINIMO_SENHA))).toBe(true);
    expect(senhaValida("a".repeat(TAMANHO_MINIMO_SENHA - 1))).toBe(false);
  });

  it("rejeita nao-string", () => {
    expect(senhaValida(null)).toBe(false);
    expect(senhaValida(123456)).toBe(false);
  });
});

describe("campoPreenchido", () => {
  it("detecta conteudo ignorando espacos", () => {
    expect(campoPreenchido("texto")).toBe(true);
    expect(campoPreenchido("   ")).toBe(false);
    expect(campoPreenchido("")).toBe(false);
    expect(campoPreenchido(null)).toBe(false);
  });
});

describe("senhasIguais", () => {
  it("compara igualdade exata", () => {
    expect(senhasIguais("abc123", "abc123")).toBe(true);
    expect(senhasIguais("abc123", "abc124")).toBe(false);
  });
});
