// ============================================================================
// TicketFlow - Agregacoes de relatorios (funcoes puras)
// ----------------------------------------------------------------------------
// Recebem um array de chamados e devolvem dados agregados prontos para os
// graficos/KPIs da aba Relatorios. Sao puras (nao mutam a entrada) para serem
// testaveis com Vitest. A reatividade fica no composable useRelatorios.
//
// Datas vem do Firestore como Timestamp; `paraData` normaliza qualquer formato.
// ============================================================================

import { STATUS } from "../constantes/statusChamado.js";
import { paraData } from "./formatarData.js";

const MESES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const pad2 = (n) => String(n).padStart(2, "0");

/** Chave de bucket por dia: "AAAA-MM-DD". */
function chaveDia(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Chave de bucket por mes: "AAAA-MM". */
function chaveMes(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** Rotulo curto por dia: "dd/mm". */
function rotuloDia(d) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/** Rotulo curto por mes: "mmm/aa". */
function rotuloMes(d) {
  return `${MESES_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

/**
 * Inicio do periodo (local time). Para "tudo" usa a menor data de criacao
 * presente nos chamados (ou o inicio do mes atual se a lista estiver vazia).
 * @param {string} periodo - 'mes' | 'trimestre' | 'ano' | 'tudo'
 * @param {Date} agora
 * @param {object[]} chamados
 * @returns {Date}
 */
function inicioDoPeriodo(periodo, agora, chamados) {
  const a = new Date(agora);
  if (periodo === "mes") return new Date(a.getFullYear(), a.getMonth(), 1);
  if (periodo === "trimestre") {
    const x = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    x.setMonth(x.getMonth() - 3);
    return x;
  }
  if (periodo === "ano") return new Date(a.getFullYear(), 0, 1);
  // tudo: menor createdAt
  let min = null;
  for (const c of chamados) {
    const d = paraData(c.createdAt);
    if (d && (!min || d < min)) min = d;
  }
  return min || new Date(a.getFullYear(), a.getMonth(), 1);
}

/**
 * Filtra os chamados cujo `createdAt` cai no periodo. 'tudo' retorna todos.
 * @param {object[]} chamados
 * @param {string} periodo
 * @param {Date} [agora]
 * @returns {object[]}
 */
export function filtrarPorPeriodo(chamados = [], periodo = "mes", agora = new Date()) {
  if (periodo === "tudo") return [...chamados];
  const inicio = inicioDoPeriodo(periodo, agora, chamados);
  return chamados.filter((c) => {
    const d = paraData(c.createdAt);
    return d && d >= inicio;
  });
}

/**
 * Volume de chamados ao longo do tempo, com granularidade adaptativa:
 *  - 'mes'  -> por dia
 *  - demais -> por mes
 * Gera buckets continuos (vazios contam 0) de `inicio` ate `agora`.
 * @param {object[]} chamados
 * @param {string} periodo
 * @param {Date} [agora]
 * @returns {{ labels: string[], data: number[] }}
 */
export function volumePorPeriodo(chamados = [], periodo = "mes", agora = new Date()) {
  const porDia = periodo === "mes";
  const inicio = inicioDoPeriodo(periodo, agora, chamados);
  const fim = new Date(agora);

  const labels = [];
  const data = [];
  const indice = new Map();

  if (porDia) {
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const ultimo = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
    while (cursor <= ultimo) {
      indice.set(chaveDia(cursor), labels.length);
      labels.push(rotuloDia(cursor));
      data.push(0);
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    const ultimo = new Date(fim.getFullYear(), fim.getMonth(), 1);
    while (cursor <= ultimo) {
      indice.set(chaveMes(cursor), labels.length);
      labels.push(rotuloMes(cursor));
      data.push(0);
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  for (const c of chamados) {
    const d = paraData(c.createdAt);
    if (!d) continue;
    const chave = porDia ? chaveDia(d) : chaveMes(d);
    const idx = indice.get(chave);
    if (idx !== undefined) data[idx] += 1;
  }

  return { labels, data };
}

/**
 * Agrupa chamados por setor/local. Normaliza vazio -> "Nao informado".
 * Mantem os `topN` maiores e agrega o resto em "Outros".
 * @param {object[]} chamados
 * @param {number} [topN=5]
 * @returns {{ labels: string[], data: number[] }}
 */
export function agruparPorSetor(chamados = [], topN = 5) {
  const mapa = new Map();
  for (const c of chamados) {
    const bruto = (c.location || "").trim();
    const chave = bruto || "Nao informado";
    mapa.set(chave, (mapa.get(chave) || 0) + 1);
  }

  const ordenado = [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  const top = ordenado.slice(0, topN);
  const resto = ordenado.slice(topN);

  const labels = top.map((e) => e[0]);
  const data = top.map((e) => e[1]);
  if (resto.length) {
    labels.push("Outros");
    data.push(resto.reduce((soma, e) => soma + e[1], 0));
  }
  return { labels, data };
}

/**
 * Tempo medio de resolucao (resolvedAt - createdAt) sobre chamados resolvidos
 * com data de resolucao valida. Ignora resolvedAt nulo (legado) e diffs < 0.
 * @param {object[]} chamados
 * @returns {{ ms: number|null, quantidade: number }}
 */
export function tempoMedioResolucao(chamados = []) {
  let soma = 0;
  let qtd = 0;
  for (const c of chamados) {
    if (c.status !== STATUS.RESOLVIDO) continue;
    const ini = paraData(c.createdAt);
    const fim = paraData(c.resolvedAt);
    if (!ini || !fim) continue;
    const diff = fim.getTime() - ini.getTime();
    if (diff < 0) continue;
    soma += diff;
    qtd += 1;
  }
  return { ms: qtd ? soma / qtd : null, quantidade: qtd };
}

/**
 * Taxa de resolucao e backlog.
 * backlog = aberto + em andamento + aguardando solicitante.
 * @param {object[]} chamados
 * @returns {{ percentual: number, resolvidos: number, total: number, backlog: number }}
 */
export function taxaResolucao(chamados = []) {
  const total = chamados.length;
  let resolvidos = 0;
  let backlog = 0;
  for (const c of chamados) {
    if (c.status === STATUS.RESOLVIDO) resolvidos += 1;
    if (
      c.status === STATUS.ABERTO ||
      c.status === STATUS.EM_ANDAMENTO ||
      c.status === STATUS.AGUARDANDO_SOLICITANTE
    ) {
      backlog += 1;
    }
  }
  return {
    percentual: total ? Math.round((resolvidos / total) * 100) : 0,
    resolvidos,
    total,
    backlog,
  };
}

/**
 * Ranking de solicitantes por quantidade de chamados abertos.
 * @param {object[]} chamados
 * @param {number} [topN=5]
 * @returns {{ id: string, nome: string, quantidade: number }[]}
 */
export function topSolicitantes(chamados = [], topN = 5) {
  const mapa = new Map();
  for (const c of chamados) {
    const id = c.requesterId || c.requesterName || "desconhecido";
    const atual = mapa.get(id) || { id, nome: c.requesterName || "Desconhecido", quantidade: 0 };
    atual.quantidade += 1;
    mapa.set(id, atual);
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, topN);
}

/**
 * Formata uma duracao em ms de forma curta: "5 h" (abaixo de 1 dia) ou
 * "2,4 dias". Retorna "—" quando ms e null/indefinido.
 * @param {number|null} ms
 * @returns {string}
 */
export function formatarDuracao(ms) {
  if (ms == null) return "—";
  const horas = ms / 3600000;
  if (horas < 24) {
    const h = Math.max(1, Math.round(horas));
    return `${h} h`;
  }
  const dias = horas / 24;
  return `${dias.toFixed(1).replace(".", ",")} dias`;
}
