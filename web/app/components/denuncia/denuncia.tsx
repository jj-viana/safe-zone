'use client'

import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { useReportSubmission } from "@/lib/hooks/use-report-submission"

const MapSelector = dynamic(() => import("../map/map-selector"), {
  ssr: false,
})

type PresetLocation = { lat: number; lng: number }

const formatCoordinates = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`

const DESCRIPTION_MAX_LENGTH = 2048

interface DenunciaModalProps {
  show: boolean
  onCloseAction: () => void
  presetLocation?: PresetLocation | null
}

export default function DenunciaModal({ show, onCloseAction, presetLocation = null }: DenunciaModalProps) {
  const [formStep, setFormStep] = useState(0)
  const [crimeGenre, setCrimeGenre] = useState<string | null>(null)
  const [crimeType, setCrimeType] = useState<string | null>(null)
  const [crimeDate, setCrimeDate] = useState("")
  const [crimeTime, setCrimeTime] = useState("")
  const [resolved, setResolved] = useState<string | null>(null)
  const [ageGroup, setAgeGroup] = useState<string | null>(null)
  const [genderIdentity, setGenderIdentity] = useState<string | null>(null)
  const [sexualOrientation, setSexualOrientation] = useState<string | null>(null)
  const [ethnicity, setEthnicity] = useState<string | null>(null)
  const [description, setDescription] = useState("")

  const [location, setLocation] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  const { submitReport, isSubmitting, submitError, clearError } = useReportSubmission()

  const crimeTypeOptions: Record<string, { id: string; label: string }[]> = {
    "Crime": [
      { id: "A", label: "Assalto ou tentativa de assalto" },
      { id: "B", label: "Violência Verbal" },
      { id: "C", label: "Violência Física" },
      { id: "D", label: "Furto" },
      { id: "E", label: "Vandalismo" },
      { id: "F", label: "Assédio" },
    ],
    "Sensação de insegurança": [
      { id: "G", label: "Iluminação Precária" },
      { id: "H", label: "Abandono de local público" },
    ],
  }

  const isValidDate = (date: string): boolean => {
    if (!date || date.length !== 10) return false
    const regex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!regex.test(date)) return false

    const [dayStr, monthStr, yearStr] = date.split("/")
    const day = Number(dayStr)
    const month = Number(monthStr)
    const year = Number(yearStr)

    const parsed = new Date(year, month - 1, day)
    const isSameDate =
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day

    if (!isSameDate) return false

    const now = new Date()
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return parsed.getTime() <= endOfToday.getTime()
  }

  /**
   * Valida se o horário está no formato correto HH:mm
   */
  const isValidTime = (time: string): boolean => {
    if (!time) return false
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
    return regex.test(time)
  }

  /**
   * Valida se a data e hora combinadas não estão no futuro
   */
  const isDateTimeNotInFuture = (date: string, time: string): boolean => {
    if (!date || !time) return true // Se não tiver ambos, deixa outras validações tratarem
    if (!isValidDate(date) || !isValidTime(time)) return true // Se formato inválido, deixa outras validações tratarem
    
    const [dayStr, monthStr, yearStr] = date.split("/")
    const day = Number(dayStr)
    const month = Number(monthStr)
    const year = Number(yearStr)
    
    const [hourStr, minuteStr] = time.split(":")
    const hour = Number(hourStr)
    const minute = Number(minuteStr)
    
    const dateTime = new Date(year, month - 1, day, hour, minute)
    const now = new Date()
    
    return dateTime.getTime() <= now.getTime()
  }

  /**
   * Valida os campos obrigatórios de cada step
   */
  const validateStep = (step: number): boolean => {
    const errors: Record<string, boolean> = {}
    
    switch (step) {
      case 1:
        if (!crimeGenre) errors.crimeGenre = true
        if (!crimeType) errors.crimeType = true
        break
      case 2:
        if (!isValidDate(crimeDate)) errors.crimeDate = true
        if (!isValidTime(crimeTime)) errors.crimeTime = true
        if (!isDateTimeNotInFuture(crimeDate, crimeTime)) errors.crimeDateTime = true
        break
      case 3:
        if (!resolved) errors.resolved = true
        if (!description || description.trim().length === 0) errors.description = true
        break
      default:
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(crimeGenre && crimeType)
      case 2:
        return isValidDate(crimeDate) && isValidTime(crimeTime) && isDateTimeNotInFuture(crimeDate, crimeTime)
      case 3:
        return !!(resolved && description && description.trim().length > 0)
      default:
        return true
    }
  }

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateStep(formStep)) {
      setValidationErrors({})
      setFormStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setFormStep((prev) => Math.max(prev - 1, 0))
  }

  const goToHome = () => setFormStep(0)

  const handleSelect = (value: string, currentValue: string | null, setter: (val: string | null) => void) => {
    if (currentValue === value) {
      setter(null)
    } else {
      setter(value) 
    }
  }

  // Captura coordenadas selecionadas no mapa e aplica o formato
  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation(formatCoordinates(lat, lng))
  }

  const resetForm = () => {
    setFormStep(0)
    setCrimeGenre(null)
    setCrimeType(null)
    setCrimeDate("")
    setCrimeTime("")
    setResolved(null)
    setAgeGroup(null)
    setGenderIdentity(null)
    setSexualOrientation(null)
    setEthnicity(null)
    setDescription("")
    setLocation("")
    setValidationErrors({})
    clearError()
  }

  const handleClose = () => {
    onCloseAction()
    setTimeout(() => {
      resetForm()
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submissionErrors: Record<string, boolean> = {}

    if (!isValidDate(crimeDate)) submissionErrors.crimeDate = true
    if (!isValidTime(crimeTime)) submissionErrors.crimeTime = true
    if (!isDateTimeNotInFuture(crimeDate, crimeTime)) submissionErrors.crimeDateTime = true
    if (!resolved) submissionErrors.resolved = true
    if (!description || description.trim().length === 0) submissionErrors.description = true

    if (Object.keys(submissionErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...submissionErrors }))
      return
    }

    const result = await submitReport({
      crimeGenre,
      crimeType,
      crimeDate,
      crimeTime,
      description,
      resolved,
      ageGroup,
      genderIdentity,
      sexualOrientation,
      ethnicity,
      location,
    })

    if (result.success) {
      setFormStep(6)
    }
  }

  // Preenche a localização quando o modal é aberto a partir do mapa
  useEffect(() => {
    if (!show || !presetLocation) return
    const formatted = formatCoordinates(presetLocation.lat, presetLocation.lng)
    setLocation(formatted)
  }, [presetLocation, show])

  const parsedLocation = useMemo(() => {
    if (!location) return null
    const [latStr, lngStr] = location.split(",")
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return [lat, lng] as [number, number]
  }, [location])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-neutral-900 p-8 rounded-2xl w-[700px] text-white relative flex flex-col items-center border border-[#24BBE0]/30 shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/raposa.svg"
              alt="Raposa"
              width={80}
              height={80}
              className="w-20 h-20 mb-4"
              priority
            />

            {/* STEP 0 */}
            {formStep === 0 && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center">Denuncie Aqui!</h2>
                <p className="text-[#24BBE0] mb-4 text-center">
                  Nos fale um pouco sobre o que você está passando!
                </p>

                <p className="mb-4 text-center">
                  Você já sentiu insegurança em algum lugar da cidade, como uma área mal iluminada ou pouco movimentada? 
                  Tem algum relato de crime ou situação de risco, resolvida ou não pelos órgãos competentes?
                </p>
                <p className="mb-4 text-center">
                  Conte pra gente. Sua contribuição ajuda a mapear pontos mais vulneráveis e fortalecer a segurança do Distrito Federal.
                </p>
                <p className="mb-4 text-center">
                  O envio é totalmente anônimo e seguro.
                </p>

                <form className="flex flex-col gap-3 w-full" onSubmit={nextStep}>
                  <button
                    type="submit"
                    className="bg-[#24BBE0] hover:bg-blue-500 p-2 rounded font-semibold flex items-center justify-center gap-2"
                  >
                    Forms <FaArrowRight />
                  </button>
                </form>
              </>
            )}

            {/* STEP 1 */}
            {formStep === 1 && (
              <>
                <div className="w-full">
                  {/* Voltar à Página Inicial */}
                  <button
                    type="button"
                    onClick={goToHome}
                    className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                  >
                    ← Página Inicial
                  </button>

                  <h2 className="text-3xl font-bold mb-6 text-center">Informações básicas</h2>

                  <form className="flex flex-col gap-6" onSubmit={nextStep}>
                    <div>
                      <p className="font-semibold mb-3">
                        Seu relato é sobre? <span className="text-red-400">*</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "A", label: "Crime" },
                          { id: "B", label: "Sensação de insegurança" },
                        ].map((item) => {
                          const selected = crimeGenre === item.label
                          return (
                            <button
                              type="button"
                              key={item.label}
                              onClick={() => {
                                const isSameSelection = crimeGenre === item.label
                                const nextGenre = isSameSelection ? null : item.label
                                setCrimeGenre(nextGenre)
                                setCrimeType(null)
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  crimeGenre: false,
                                  crimeType: false,
                                }))
                              }}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                                selected
                                  ? "border-[#FF7A00] text-white"
                                  : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                              }`}
                            >
                              <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                  selected
                                    ? "bg-[#FF7A00] text-black"
                                    : "bg-neutral-600 text-white"
                                }`}
                              >
                                {item.id}
                              </span>
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                      {validationErrors.crimeGenre && (
                        <p className="text-sm text-red-400 mt-2">
                          Por favor, selecione uma opção
                        </p>
                      )}
                    </div>

                    {crimeGenre && (
                      <div>
                        <p className="font-semibold mb-3">
                          Qual é a natureza da ocorrência? <span className="text-red-400">*</span>
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {(crimeTypeOptions[crimeGenre] || []).map((item) => {
                            const selected = crimeType === item.label
                            return (
                              <button
                                type="button"
                                key={item.label}
                                onClick={() => {
                                  handleSelect(item.label, crimeType, setCrimeType)
                                  setValidationErrors((prev) => ({ ...prev, crimeType: false }))
                                }}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                                  selected
                                    ? "border-[#FF7A00] text-white"
                                    : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                    selected
                                      ? "bg-[#FF7A00] text-black"
                                      : "bg-neutral-600 text-white"
                                  }`}
                                >
                                  {item.id}
                                </span>
                                {item.label}
                              </button>
                            )
                          })}
                        </div>
                        {validationErrors.crimeType && (
                          <p className="text-sm text-red-400 mt-2">
                            Por favor, selecione uma opção
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!canProceed(1)}
                      className="mt-6 bg-[#24BBE0] hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded font-semibold flex items-center justify-center gap-2 self-center w-40"
                    >
                      Próximo <FaArrowRight />
                    </button>
                  </form>
                </div>
              </>
            )}

            {formStep === 2 && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={goToHome}
                  className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                >
                  ← Página Inicial
                </button>

                <h2 className="text-3xl font-bold mb-6 text-center">Informações básicas</h2>

                <form className="flex flex-col gap-6" onSubmit={nextStep}>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="font-semibold mb-2">
                        Quando aconteceu? <span className="text-red-400">*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="DD / MM / YYYY"
                        value={crimeDate}
                        onChange={(e) => {
                          let input = e.target.value.replace(/\D/g, "")
                          if (input.length > 8) input = input.slice(0, 8)
                          if (input.length >= 7) {
                            input = input.replace(/^(\d{2})(\d{2})(\d{3,4}).*/, "$1/$2/$3")
                          } else if (input.length > 4) {
                            input = input.replace(/^(\d{2})(\d{2})(\d{1,2})/, "$1/$2/$3")
                          } else if (input.length > 2) {
                            input = input.replace(/^(\d{2})(\d{0,2})/, "$1/$2")
                          }

                          setCrimeDate(input)
                          setValidationErrors((prev) => ({
                            ...prev,
                            crimeDate: false,
                            crimeDateTime: false,
                          }))
                        }}
                        onBlur={() => {
                          if (crimeDate.length > 0) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              crimeDate: !isValidDate(crimeDate),
                              crimeDateTime: !isDateTimeNotInFuture(crimeDate, crimeTime),
                            }))
                          }
                        }}
                        maxLength={10}
                        className={`bg-neutral-800 text-white p-2 rounded-md w-40 text-center focus:outline-none focus:ring-2 ${
                          validationErrors.crimeDate ? 'ring-2 ring-red-400' : 'focus:ring-[#24BBE0]'
                        }`}
                      />
                      {validationErrors.crimeDate && (
                        <p className="text-sm text-red-400 mt-2">
                          Por favor, insira uma data válida no formato DD/MM/YYYY
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold mb-2">
                        Em qual horário? <span className="text-red-400">*</span>
                      </p>
                      <input
                        type="time"
                        value={crimeTime}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          setCrimeTime(nextValue)
                          setValidationErrors((prev) => ({
                            ...prev,
                            crimeTime: false,
                            crimeDateTime: false,
                          }))
                        }}
                        onBlur={() => {
                          if (crimeTime.length > 0) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              crimeTime: !isValidTime(crimeTime),
                              crimeDateTime: !isDateTimeNotInFuture(crimeDate, crimeTime),
                            }))
                          }
                        }}
                        className={`bg-neutral-800 text-white p-2 rounded-md w-32 text-center focus:outline-none focus:ring-2 ${
                          validationErrors.crimeTime ? 'ring-2 ring-red-400' : 'focus:ring-[#24BBE0]'
                        }`}
                      />
                      {validationErrors.crimeTime && (
                        <p className="text-sm text-red-400 mt-2">
                          Horário deve estar no formato HH:mm entre 00:00 e 23:59
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {validationErrors.crimeDateTime && (
                    <p className="text-sm text-red-400 mt-2">
                      A data e horário não podem estar no futuro
                    </p>
                  )}

                  <div>
                    <p className="font-semibold mb-2">Onde aconteceu?</p>
                    <div className="w-full h-[250px] rounded-lg overflow-hidden">
                      <MapSelector
                        onLocationSelect={handleLocationSelect}
                        selectedPosition={parsedLocation}
                      />
                    </div>
                    {location && (
                      <p className="text-xs text-gray-400 mt-2">
                        Coordenadas selecionadas: {location}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-transparent border border-[#24BBE0] text-[#24BBE0] px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-[#24BBE0]/10"
                    >
                      <FaArrowLeft /> Voltar 
                    </button>

                    <button
                      type="submit"
                      disabled={!canProceed(2)}
                      className="bg-[#24BBE0] hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                    >
                      Próximo <FaArrowRight />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3 */}
            {formStep === 3 && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={goToHome}
                  className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                >
                  ← Página Inicial
                </button>

                <h2 className="text-3xl font-bold mb-6 text-center">Informações básicas</h2>

                <form className="flex flex-col gap-6" onSubmit={nextStep}>
                  {/* Pergunta: situação resolvida */}
                  <div>
                    <p className="font-semibold mb-3">
                      A situação já foi resolvida? <span className="text-red-400">*</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "Sim" },
                        { id: "B", label: "Não" },
                        { id: "C", label: "Não se aplica" },
                      ].map((item) => {
                        const selected = resolved === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => {
                              handleSelect(item.label, resolved, setResolved)
                              setValidationErrors({ ...validationErrors, resolved: false })
                            }}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                              selected
                                ? "border-[#FF7A00] text-white"
                                : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-[#FF7A00] text-black"
                                  : "bg-neutral-600 text-white"
                              }`}
                            >
                              {item.id}
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                    {validationErrors.resolved && (
                      <p className="text-sm text-red-400 mt-2">
                        Por favor, selecione uma opção
                      </p>
                    )}
                  </div>

                  {/* Campo de depoimento */}
                  <div>
                    <p className="font-semibold mb-2">
                      Depoimento <span className="text-red-400">*</span>
                    </p>
                    <textarea
                      placeholder="Descreva aqui ..."
                      value={description}
                      onChange={(e) => {
                        const inputValue = e.target.value.slice(0, DESCRIPTION_MAX_LENGTH)
                        setDescription(inputValue)
                        setValidationErrors((prev) => ({
                          ...prev,
                          description: false,
                        }))
                      }}
                      onBlur={() => {
                        if (description.length > 0) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            description: description.trim().length === 0,
                          }))
                        }
                      }}
                      className={`w-full bg-neutral-800 text-white p-3 rounded-md h-40 resize-none focus:outline-none focus:ring-2 ${
                        validationErrors.description ? 'ring-2 ring-red-400' : 'focus:ring-[#24BBE0]'
                      }`}
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {description.length}/{DESCRIPTION_MAX_LENGTH} caracteres
                    </p>
                    {validationErrors.description && (
                      <p className="text-sm text-red-400 mt-2">
                        Por favor, descreva o que aconteceu
                      </p>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-transparent border border-[#24BBE0] text-[#24BBE0] px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-[#24BBE0]/10"
                    >
                      <FaArrowLeft /> Voltar
                    </button>

                    <button
                      type="submit"
                      disabled={!canProceed(3)}
                      className="bg-[#24BBE0] hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                    >
                      Próximo <FaArrowRight />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4 */}
            {formStep === 4 && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={goToHome}
                  className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                >
                  ← Página Inicial
                </button>

                <h2 className="text-3xl font-bold mb-6 text-center">Informações opcionais</h2>

                <form className="flex flex-col gap-8" onSubmit={nextStep}>
                  {/* Faixa etária */}
                  <div>
                    <p className="font-semibold mb-3">Faixa etária</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "< 18" },
                        { id: "B", label: "18 - 29" },
                        { id: "C", label: "30 - 44" },
                        { id: "D", label: "45 - 59" },
                        { id: "E", label: "≥ 60" },
                        { id: "F", label: "Prefiro não informar" },
                      ].map((item) => {
                        const selected = ageGroup === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => handleSelect(item.label, ageGroup, setAgeGroup)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                              selected
                                ? "border-[#FF7A00] text-white"
                                : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-[#FF7A00] text-black"
                                  : "bg-neutral-600 text-white"
                              }`}
                            >
                              {item.id}
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Identidade de gênero */}
                  <div>
                    <p className="font-semibold mb-3">Identidade de Gênero</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "Mulher Cisgênero" },
                        { id: "B", label: "Mulher Transgênero" },
                        { id: "C", label: "Pessoa não binária" },
                        { id: "D", label: "Homem Cisgênero" },
                        { id: "E", label: "Homem Transgênero" },
                        { id: "F", label: "Prefiro não informar" },
                      ].map((item) => {
                        const selected = genderIdentity === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => handleSelect(item.label, genderIdentity, setGenderIdentity)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                              selected
                                ? "border-[#FF7A00] text-white"
                                : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-[#FF7A00] text-black"
                                  : "bg-neutral-600 text-white"
                              }`}
                            >
                              {item.id}
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-transparent border border-[#24BBE0] text-[#24BBE0] px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-[#24BBE0]/10"
                    >
                      <FaArrowLeft /> Voltar
                    </button>

                    <button
                      type="submit"
                      className="bg-[#24BBE0] hover:bg-blue-500 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                    >
                      Próximo <FaArrowRight />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5 */}
            {formStep === 5 && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={goToHome}
                  className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                >
                  ← Página Inicial
                </button>

                <h2 className="text-3xl font-bold mb-6 text-center">Informações opcionais</h2>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
                    {submitError}
                  </div>
                )}

                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                  <div>
                    <p className="font-semibold mb-3">Orientação Sexual</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "Heterossexual" },
                        { id: "B", label: "Bissexual" },
                        { id: "C", label: "Homossexual" },
                        { id: "D", label: "Assexual" },
                        { id: "E", label: "Outro" },
                        { id: "F", label: "Prefiro não informar" },
                      ].map((item) => {
                        const selected = sexualOrientation === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => handleSelect(item.label, sexualOrientation, setSexualOrientation)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                              selected
                                ? "border-[#FF7A00] text-white"
                                : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-[#FF7A00] text-black"
                                  : "bg-neutral-600 text-white"
                              }`}
                            >
                              {item.id}
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-3">Raça/Cor</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "Branca" },
                        { id: "B", label: "Negra" },
                        { id: "C", label: "Parda" },
                        { id: "D", label: "Indígena" },
                        { id: "E", label: "Amarela" },
                        { id: "F", label: "Prefiro não informar" },
                      ].map((item) => {
                        const selected = ethnicity === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => handleSelect(item.label, ethnicity, setEthnicity)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                              selected
                                ? "border-[#FF7A00] text-white"
                                : "border-neutral-600 bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-[#FF7A00] text-black"
                                  : "bg-neutral-600 text-white"
                              }`}
                            >
                              {item.id}
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-transparent border border-[#24BBE0] text-[#24BBE0] px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-[#24BBE0]/10"
                    >
                      <FaArrowLeft /> Voltar
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#FF7A00] hover:bg-[#c36003] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar"} <FaArrowRight />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 6 */}
            {formStep === 6 && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center">Agradecemos pela sua colaboração!</h2>
                <p className="text-[#24BBE0] mb-4 text-center">
                  Sua denúncia foi registrada com sucesso.
                </p>

                <p className="mb-4 text-center">
                  Sua contribuição ajudará a tornar a região mais segura para todos!
                </p>
                <p className="mb-4 text-center">
                  Lembramos que sua denúncia é totalmente anônima. Se tiver dúvidas ou quiser nos contatar, estamos disponíveis pelo nosso canal no GitHub.
                </p>
                <p className="mb-4 text-center">
                  No SafeZone, sua participação faz a diferença!
                </p>

                <button
                  onClick={handleClose}
                  className="mt-6 bg-[#24BBE0] hover:bg-blue-500 text-white px-8 py-2 rounded font-semibold"
                >
                  Fechar
                </button>
              </>
            )}



            {/* Botão de fechar */}
            <button
              className="absolute top-2 right-2 hover:text-white text-gray-400"
              onClick={handleClose}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
