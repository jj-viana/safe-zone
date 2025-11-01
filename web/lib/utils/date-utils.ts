/**
 * Utilitários para manipulação e formatação de datas.
 */

/**
 * Converte uma data no formato DD/MM/YYYY para ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @param dateString - String de data no formato DD/MM/YYYY.
 * @returns String no formato ISO 8601 ou null se a data for inválida.
 */
export function convertToIsoDate(dateString: string): string | null {
  if (!dateString || dateString.length < 10) {
    return null;
  }

  // Extrai DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Valida os valores
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  if (day < 1 || day > 31) {
    return null;
  }

  if (year < 1900 || year > 2100) {
    return null;
  }

  // Cria a data (mês é 0-indexed no JS)
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  // Verifica se a data é válida (ex: 31/02 seria inválida)
  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year
  ) {
    return null;
  }

  return date.toISOString();
}

/**
 * Valida se uma string de data está no formato DD/MM/YYYY e é uma data válida.
 * @param dateString - String de data para validar.
 * @returns true se a data for válida, false caso contrário.
 */
export function isValidDateString(dateString: string): boolean {
  return convertToIsoDate(dateString) !== null;
}

/**
 * Converte data (DD/MM/YYYY) e hora (HH:mm) para ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @param dateString - String de data no formato DD/MM/YYYY.
 * @param timeString - String de hora no formato HH:mm.
 * @returns String no formato ISO 8601 ou null caso os valores sejam inválidos.
 */
export function convertToIsoDateTime(dateString: string, timeString: string): string | null {
  if (!dateString || !timeString) {
    return null;
  }

  const dateParts = dateString.split('/');
  if (dateParts.length !== 3) {
    return null;
  }

  const [dayStr, monthStr, yearStr] = dateParts;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  if (day < 1 || day > 31) {
    return null;
  }

  if (year < 1900 || year > 2100) {
    return null;
  }

  const timeParts = timeString.split(':');
  if (timeParts.length < 2) {
    return null;
  }

  const [hourStr, minuteStr] = timeParts;
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23) {
    return null;
  }

  if (minutes < 0 || minutes > 59) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year ||
    date.getUTCHours() !== hours ||
    date.getUTCMinutes() !== minutes
  ) {
    return null;
  }

  return date.toISOString();
}
