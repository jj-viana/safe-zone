type KnownStatus = 'draft' | 'approved' | 'denied';

type StatusLabels = {
  singular: string;
  plural: string;
};

const STATUS_LABEL_MAP: Record<KnownStatus, StatusLabels> = {
  draft: {
    singular: 'Rascunho',
    plural: 'Rascunhos',
  },
  approved: {
    singular: 'Aprovado',
    plural: 'Aprovados',
  },
  denied: {
    singular: 'Negado',
    plural: 'Negados',
  },
};

const isKnownStatus = (value: string): value is KnownStatus =>
  value === 'draft' || value === 'approved' || value === 'denied';

/**
 * Normaliza um status recebido da API para comparação.
 * Converte variações (ex.: "Rejected") para o equivalente conhecido.
 */
export const normalizeStatusValue = (status: string): string => {
  if (!status) {
    return '';
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === 'rejected') {
    return 'denied';
  }

  return normalized;
};

/**
 * Converte um status em uma etiqueta legível em português.
 * @param status - Valor do status (qualquer formato conhecido pela API).
 * @param options - Opções para definir pluralização.
 * @returns Etiqueta do status para exibição ao usuário.
 */
export const getStatusLabel = (status: string, options?: { plural?: boolean }): string => {
  const normalized = normalizeStatusValue(status);

  if (isKnownStatus(normalized)) {
    const labels = STATUS_LABEL_MAP[normalized];
    return options?.plural ? labels.plural : labels.singular;
  }

  return status;
};
