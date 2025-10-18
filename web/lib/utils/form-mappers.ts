/**
 * Mapeamentos entre valores do formulário e valores esperados pela API.
 * Os valores agora são mantidos em português conforme solicitado.
 */

import type { CreateReportRequest, ReporterDetailsRequest } from '../api/types';

/**
 * Mapa de resolução (UI) para resolved (API).
 * Este é o único mapeamento que converte para booleano.
 */
export const RESOLVED_MAP: Record<string, boolean> = {
  'Sim': true,
  'Não': false,
  'Não se aplica': false,
};

/**
 * Converte valores do formulário para o formato esperado pela API.
 * Os valores de texto são mantidos em português conforme inseridos pelo usuário.
 * @param formData - Dados coletados do formulário.
 * @returns Objeto no formato CreateReportRequest.
 */
export function mapFormDataToApiRequest(formData: {
  crimeGenre: string | null;
  crimeType: string | null;
  crimeDate: string; // ISO format
  description: string;
  resolved: string | null;
  ageGroup: string | null;
  genderIdentity: string | null;
  sexualOrientation: string | null;
  ethnicity: string | null;
  location: string; // Coordenadas ou endereço
}): CreateReportRequest {
  // Monta os detalhes do denunciante (opcional)
  // Valores são mantidos em português como fornecidos pelo usuário
  const reporterDetails: ReporterDetailsRequest | null =
    formData.ageGroup ||
    formData.genderIdentity ||
    formData.sexualOrientation ||
    formData.ethnicity
      ? {
          ageGroup: formData.ageGroup || null,
          genderIdentity: formData.genderIdentity || null,
          sexualOrientation: formData.sexualOrientation || null,
          ethnicity: formData.ethnicity || null,
        }
      : null;

  const request: CreateReportRequest = {
    crimeGenre: formData.crimeGenre || 'Não especificado',
    crimeType: formData.crimeType || 'Não especificado',
    description: formData.description || '',
    location: formData.location || 'Não especificado',
    crimeDate: formData.crimeDate,
    reporterDetails: reporterDetails,
    resolved: formData.resolved
      ? RESOLVED_MAP[formData.resolved] ?? false
      : false,
  };

  return request;
}
