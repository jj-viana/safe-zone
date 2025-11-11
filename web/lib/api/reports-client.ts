/**
 * Cliente HTTP para interação com a API de reports.
 * Implementa métodos para criar, listar e gerenciar denúncias.
 */

import type { CreateReportRequest, ReportResponse, ApiError } from './types';

// Base URL da API - usar variável de ambiente
// NEXT_PUBLIC_ é necessário para acessar no browser (Client Components)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5206';

/**
 * Classe de erro customizada para respostas da API.
 */
export class ApiResponseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public apiError?: ApiError
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

/**
 * Cliente para operações relacionadas a reports (denúncias).
 */
export class ReportsClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Cria uma nova denúncia.
   * @param request - Dados da denúncia a ser criada.
   * @returns Promise com a denúncia criada.
   * @throws {ApiResponseError} Quando a requisição falha.
   */
  async createReport(request: CreateReportRequest): Promise<ReportResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Failed to parse error response',
        }));

        throw new ApiResponseError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: ReportResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      // Erros de rede ou outros erros inesperados
      throw new ApiResponseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * Lista denúncias, permitindo filtrar por status.
   * @param status - Status opcional para filtrar (ex: "Approved").
   * @returns Promise com array de denúncias.
   * @throws {ApiResponseError} Quando a requisição falha.
   */
  async getAllReports(status?: string): Promise<ReportResponse[]> {
    try {
      const url = new URL('/api/reports', this.baseUrl);
      if (status && status.trim().length > 0) {
        url.searchParams.set('status', status.trim());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Failed to parse error response',
        }));

        throw new ApiResponseError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: ReportResponse[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      throw new ApiResponseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * Busca uma denúncia por ID.
   * @param id - ID da denúncia.
   * @returns Promise com a denúncia encontrada ou null se não existir.
   * @throws {ApiResponseError} Quando a requisição falha.
   */
  async getReportById(id: string): Promise<ReportResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/reports/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Failed to parse error response',
        }));

        throw new ApiResponseError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: ReportResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      throw new ApiResponseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * Busca denúncias por gênero do crime.
   * @param crimeGenre - Gênero do crime (ex: "theft", "violence").
   * @returns Promise com array de denúncias.
   * @throws {ApiResponseError} Quando a requisição falha.
   */
  async getReportsByCrimeGenre(crimeGenre: string): Promise<ReportResponse[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/reports/crime-genre/${encodeURIComponent(crimeGenre)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Failed to parse error response',
        }));

        throw new ApiResponseError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: ReportResponse[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      throw new ApiResponseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }
}

/**
 * Instância singleton do cliente de reports.
 * Usar esta instância para fazer chamadas à API.
 */
export const reportsClient = new ReportsClient();
