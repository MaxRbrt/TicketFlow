// ============================================================================
// TicketFlow - Utilitario de formatacao de datas
// ----------------------------------------------------------------------------
// O Firestore devolve datas como objetos Timestamp (com metodo `toDate()`),
// mas tambem podemos receber Date, string ISO ou numero (epoch). Estas funcoes
// normalizam qualquer um desses formatos e formatam para pt-BR.
// ============================================================================

/**
 * Converte qualquer valor de data suportado em um objeto Date valido.
 * Aceita: Firestore Timestamp, Date, string ISO ou numero (epoch ms).
 * @param {*} valor - Data em qualquer formato suportado.
 * @returns {Date|null} Date valido ou null se nao for possivel converter.
 */
export function paraData(valor) {
  if (!valor) {
    return null;
  }

  // Firestore Timestamp possui o metodo toDate().
  if (typeof valor.toDate === "function") {
    return valor.toDate();
  }

  // Ja e um Date.
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  // String ISO ou numero epoch.
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Formata uma data como "dd/mm/aaaa".
 * @param {*} valor - Data em qualquer formato suportado.
 * @param {string} [aoFalhar="-"] - Texto exibido quando a data e invalida.
 */
export function formatarData(valor, aoFalhar = "-") {
  const data = paraData(valor);
  if (!data) {
    return aoFalhar;
  }
  return data.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data com hora como "dd/mm/aaaa hh:mm".
 * @param {*} valor - Data em qualquer formato suportado.
 * @param {string} [aoFalhar="-"] - Texto exibido quando a data e invalida.
 */
export function formatarDataHora(valor, aoFalhar = "-") {
  const data = paraData(valor);
  if (!data) {
    return aoFalhar;
  }
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata uma data de forma relativa ("ha 5 minutos", "ha 2 dias").
 * Util para listas de chamados recentes. Cai para data absoluta acima de ~30
 * dias, evitando textos pouco informativos.
 * @param {*} valor - Data em qualquer formato suportado.
 * @param {string} [aoFalhar="-"] - Texto exibido quando a data e invalida.
 */
export function formatarDataRelativa(valor, aoFalhar = "-") {
  const data = paraData(valor);
  if (!data) {
    return aoFalhar;
  }

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);

  if (segundos < 60) {
    return "agora mesmo";
  }
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) {
    return `ha ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `ha ${horas} ${horas === 1 ? "hora" : "horas"}`;
  }
  const dias = Math.floor(horas / 24);
  if (dias < 30) {
    return `ha ${dias} ${dias === 1 ? "dia" : "dias"}`;
  }

  // Para periodos longos, mostra a data absoluta.
  return formatarData(data, aoFalhar);
}
