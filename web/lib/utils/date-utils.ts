/**
 * Utilitários para manipulação e formatação de datas.
 */

/**
 * Componentes de data validados.
 */
interface DateComponents {
  day: number;
  month: number;
  year: number;
}

/**
 * Parseia e valida uma data no formato DD/MM/YYYY.
 * @param dateString - String de data no formato DD/MM/YYYY.
 * @returns Componentes de data validados ou null se a data for inválida.
 */
function parseDateComponents(dateString: string): DateComponents | null {
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

  return { day, month, year };
}

/**
 * Converte uma data no formato DD/MM/YYYY para ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @param dateString - String de data no formato DD/MM/YYYY.
 * @returns String no formato ISO 8601 ou null se a data for inválida.
 */
export function convertToIsoDate(dateString: string): string | null {
  const components = parseDateComponents(dateString);
  if (!components) {
    return null;
  }

  const date = new Date(Date.UTC(components.year, components.month - 1, components.day, 0, 0, 0, 0));
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

const SAO_PAULO_TIME_ZONE = 'America/Sao_Paulo';

const SAO_PAULO_LOCALE = 'pt-BR';

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type === 'literal') {
      continue;
    }

    values[part.type] = Number(part.value);
  }

  const fallback = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };

  const asUtc = Date.UTC(
    values.year ?? fallback.year,
    (values.month ?? fallback.month) - 1,
    values.day ?? fallback.day,
    values.hour ?? fallback.hour,
    values.minute ?? fallback.minute,
    values.second ?? fallback.second,
  );

  return asUtc - date.getTime();
}

function formatUtcDateInternal(
  isoString: string,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
): string {
  if (!isoString) {
    return fallback;
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  const formatter = new Intl.DateTimeFormat(SAO_PAULO_LOCALE, {
    timeZone: SAO_PAULO_TIME_ZONE,
    ...options,
  });

  return formatter.format(date);
}

/**
 * Converte data (DD/MM/YYYY) e hora (HH:mm) para ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
 * Interpreta os valores como horário de America/Sao_Paulo.
 * @param dateString - String de data no formato DD/MM/YYYY.
 * @param timeString - String de hora no formato HH:mm.
 * @returns String no formato ISO 8601 ou null caso os valores sejam inválidos.
 */
export function convertToIsoDateTime(dateString: string, timeString: string): string | null {
  if (!timeString) {
    return null;
  }

  const dateComponents = parseDateComponents(dateString);
  if (!dateComponents) {
    return null;
  }

  const timeParts = timeString.split(':');
  if (timeParts.length < 2) {
    return null;
  }

  const [hourStr, minuteStr] = timeParts;
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23) {
    return null;
  }

  if (minutes < 0 || minutes > 59) {
    return null;
  }

  const assumedUtc = new Date(Date.UTC(
    dateComponents.year,
    dateComponents.month - 1,
    dateComponents.day,
    hours,
    minutes,
    0,
    0,
  ));

  const offset = getTimeZoneOffset(assumedUtc, SAO_PAULO_TIME_ZONE);
  const utcTimestamp = assumedUtc.getTime() - offset;
  const zonedDate = new Date(utcTimestamp);

  return zonedDate.toISOString();
}

/**
 * Formata uma string ISO em UTC para exibição considerando America/Sao_Paulo.
 */
export function formatUtcDateInSaoPaulo(isoString: string, fallback = 'Data indisponível'): string {
  return formatUtcDateInternal(
    isoString,
    { day: '2-digit', month: 'long', year: 'numeric' },
    fallback,
  );
}

/**
 * Formata uma string ISO em UTC para data e hora considerando America/Sao_Paulo.
 */
export function formatUtcDateTimeInSaoPaulo(isoString: string, fallback = 'Data e hora indisponíveis'): string {
  return formatUtcDateInternal(
    isoString,
    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    fallback,
  );
}
