/**
 * Tipos e interfaces para comunicação com a API de reports.
 * Baseado no modelo Report.cs da API .NET.
 */

export interface ReporterDetailsRequest {
  ageGroup?: string | null;
  ethnicity?: string | null;
  genderIdentity?: string | null;
  sexualOrientation?: string | null;
}

export interface CreateReportRequest {
  crimeGenre: string;
  crimeType: string;
  description: string;
  location: string;
  region: string;
  crimeDate: string; // ISO 8601 format
  reporterDetails?: ReporterDetailsRequest | null;
  resolved: boolean;
}

export interface ReporterDetailsResponse {
  ageGroup?: string | null;
  ethnicity?: string | null;
  genderIdentity?: string | null;
  sexualOrientation?: string | null;
}

export interface ReportResponse {
  id: string;
  crimeGenre: string;
  crimeType: string;
  description: string;
  location: string;
  region: string;
  crimeDate: string;
  reporterDetails?: ReporterDetailsResponse | null;
  createdDate: string;
  resolved: boolean;
}

export interface ApiError {
  error?: string;
  traceId?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
