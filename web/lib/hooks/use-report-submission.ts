'use client'

import { useState } from 'react'
import { reportsClient, ApiResponseError } from '@/lib/api'
import type { RegiaoOption } from '@/lib/constants/regions'
import { convertToIsoDateTime } from '@/lib/utils/date-utils'
import { mapFormDataToApiRequest } from '@/lib/utils/form-mappers'

/**
 * Interface para os dados do formulário de denúncia.
 */
export interface ReportFormData {
  crimeGenre: string | null
  crimeType: string | null
  crimeDate: string
  crimeTime: string
  description: string
  resolved: string | null
  ageGroup: string | null
  genderIdentity: string | null
  sexualOrientation: string | null
  ethnicity: string | null
  location: string
  region: RegiaoOption | null
}

/**
 * Interface para o resultado da submissão.
 */
export interface SubmissionResult {
  success: boolean
  error?: string
}

/**
 * Custom hook para gerenciar a submissão de denúncias.
 * 
 * Encapsula toda a lógica de validação, transformação de dados,
 * chamada à API e tratamento de erros, seguindo o princípio de
 * separação de responsabilidades.
 * 
 * @returns {Object} Objeto contendo a função de submissão e estados
 * @returns {Function} submitReport - Função assíncrona para enviar o relatório
 * @returns {boolean} isSubmitting - Indica se há uma submissão em andamento
 * @returns {string | null} submitError - Mensagem de erro, se houver
 * @returns {Function} clearError - Limpa a mensagem de erro
 * 
 * @example
 * const { submitReport, isSubmitting, submitError, clearError } = useReportSubmission()
 * 
 * const handleSubmit = async () => {
 *   const result = await submitReport(formData)
 *   if (result.success) {
 *     // Navegar para tela de sucesso
 *   }
 * }
 */
export function useReportSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Limpa a mensagem de erro.
   */
  const clearError = () => {
    setSubmitError(null)
  }

  /**
   * Submete o relatório para a API.
   * 
   * @param formData - Dados do formulário de denúncia
   * @returns Promise com o resultado da submissão
   */
  const submitReport = async (formData: ReportFormData): Promise<SubmissionResult> => {
    setIsSubmitting(true)
    setSubmitError(null)

    console.log('🚀 Iniciando submissão do relatório...')
    console.log('📊 Form Data:', formData)

    try {
      // Valida data de ocorrência
      const isoDateTime = convertToIsoDateTime(formData.crimeDate, formData.crimeTime)
      if (!isoDateTime) {
        const errorMessage = 'Data ou horário de ocorrência inválido. Use os formatos DD/MM/YYYY e HH:mm.'
        setSubmitError(errorMessage)
        setIsSubmitting(false)
        return { success: false, error: errorMessage }
      }

      if (!formData.region) {
        const errorMessage = 'Selecione uma região válida.'
        setSubmitError(errorMessage)
        setIsSubmitting(false)
        return { success: false, error: errorMessage }
      }

      // Monta o payload da API
      const requestData = mapFormDataToApiRequest({
        crimeGenre: formData.crimeGenre,
        crimeType: formData.crimeType,
        crimeDate: isoDateTime,
        description: formData.description,
        resolved: formData.resolved,
        ageGroup: formData.ageGroup,
        genderIdentity: formData.genderIdentity,
        sexualOrientation: formData.sexualOrientation,
        ethnicity: formData.ethnicity,
        location: formData.location,
        region: formData.region,
      })

      console.log('📤 Enviando para API:', requestData)

      // Envia para a API
      await reportsClient.createReport(requestData)
      
      console.log('✅ Relatório enviado com sucesso!')

      setIsSubmitting(false)
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao enviar denúncia:', error)
      console.error('Tipo do erro:', error?.constructor?.name)

      let errorMessage: string

      if (error instanceof ApiResponseError) {
        console.error('API Error Details:', { 
          statusCode: error.statusCode, 
          apiError: error.apiError 
        })
        // Erro da API
        if (error.apiError?.errors && error.apiError.errors.length > 0) {
          const errorMessages = error.apiError.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join('; ')
          errorMessage = `Erro de validação: ${errorMessages}`
        } else {
          errorMessage = error.message || 'Erro ao enviar denúncia. Tente novamente.'
        }
      } else {
        // Erro de rede ou desconhecido
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      }

      setSubmitError(errorMessage)
      setIsSubmitting(false)
      return { success: false, error: errorMessage }
    }
  }

  return {
    submitReport,
    isSubmitting,
    submitError,
    clearError,
  }
}
