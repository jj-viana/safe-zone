'use client'

import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useState } from "react"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { useReportSubmission } from "@/lib/hooks/use-report-submission"

const MapaDepoimentos = dynamic(() => import("../map/map"), {
  ssr: false,
})

export default function DenunciaModal({ show, onCloseAction }: { show: boolean, onCloseAction: () => void }) {
  const [formStep, setFormStep] = useState(0)
  const [crimeGenre, setCrimeGenre] = useState<string | null>(null)
  const [crimeType, setCrimeType] = useState<string | null>(null)
  const [crimeDate, setCrimeDate] = useState("")
  const [resolved, setResolved] = useState<string | null>(null)
  const [ageGroup, setAgeGroup] = useState<string | null>(null)
  const [genderIdentity, setGenderIdentity] = useState<string | null>(null)
  const [sexualOrientation, setSexualOrientation] = useState<string | null>(null)
  const [ethnicity, setEthnicity] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("Brasília, DF") // TODO: Integrar com mapa
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  // Hook customizado para gerenciar a submissão do relatório
  const { submitReport, isSubmitting, submitError, clearError } = useReportSubmission()

  /**
   * Valida se a data está no formato correto DD/MM/YYYY
   */
  const isValidDate = (date: string): boolean => {
    if (!date || date.length !== 10) return false
    const regex = /^\d{2}\/\d{2}\/\d{4}$/
    return regex.test(date)
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

  /**
   * Verifica se pode avançar para o próximo step
   */
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(crimeGenre && crimeType)
      case 2:
        return isValidDate(crimeDate)
      case 3:
        return !!(resolved && description && description.trim().length > 0)
      default:
        return true
    }
  }

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valida o step atual antes de avançar
    if (validateStep(formStep)) {
      setValidationErrors({})
      setFormStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setFormStep((prev) => Math.max(prev - 1, 0))
  }

  const goToHome = () => setFormStep(0)

  /**
   * Permite selecionar e desmarcar uma opção clicando novamente
   */
  const handleSelect = (value: string, currentValue: string | null, setter: (val: string | null) => void) => {
    if (currentValue === value) {
      setter(null) // Desmarca se clicar novamente
    } else {
      setter(value) // Marca a nova opção
    }
  }

  const resetForm = () => {
    setFormStep(0)
    setCrimeGenre(null)
    setCrimeType(null)
    setCrimeDate("")
    setResolved(null)
    setAgeGroup(null)
    setGenderIdentity(null)
    setSexualOrientation(null)
    setEthnicity(null)
    setDescription("")
    setLocation("Brasília, DF")
    setValidationErrors({})
    clearError()
  }

  const handleClose = () => {
    onCloseAction()
    // Aguarda um momento antes de resetar para permitir animação de saída
    setTimeout(() => {
      resetForm()
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Submete o relatório usando o hook customizado
    const result = await submitReport({
      crimeGenre,
      crimeType,
      crimeDate,
      description,
      resolved,
      ageGroup,
      genderIdentity,
      sexualOrientation,
      ethnicity,
      location,
    })

    // Se sucesso, avança para a tela de confirmação
    if (result.success) {
      setFormStep(6)
    }
  }

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
                                handleSelect(item.label, crimeGenre, setCrimeGenre)
                                setValidationErrors({ ...validationErrors, crimeGenre: false })
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

                    <div>
                      <p className="font-semibold mb-3">
                        Qual é a natureza da ocorrência? <span className="text-red-400">*</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "A", label: "Assalto ou tentativa de assalto" },
                          { id: "B", label: "Violência Verbal" },
                          { id: "C", label: "Violência Física" },
                          { id: "D", label: "Furto" },
                          { id: "E", label: "Vandalismo" },
                          { id: "F", label: "Assédio" },
                          { id: "G", label: "Iluminação Precária" },
                          { id: "H", label: "Abandono de local público" },
                        ].map((item) => {
                          const selected = crimeType === item.label
                          return (
                            <button
                              type="button"
                              key={item.label}
                              onClick={() => {
                                handleSelect(item.label, crimeType, setCrimeType)
                                setValidationErrors({ ...validationErrors, crimeType: false })
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
                          // Format as DD/MM/YYYY when 7 or 8 digits are present
                          input = input.replace(/^(\d{2})(\d{2})(\d{3,4}).*/, "$1/$2/$3")
                        } else if (input.length > 4) {
                          // Format as DD/MM/YY or DD/MM/Y
                          input = input.replace(/^(\d{2})(\d{2})(\d{1,2})/, "$1/$2/$3")
                        } else if (input.length > 2) {
                          // Format as DD/MM
                          input = input.replace(/^(\d{2})(\d{0,2})/, "$1/$2")
                        }
                        setCrimeDate(input)
                        setValidationErrors({ ...validationErrors, crimeDate: false })
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
                    <p className="font-semibold mb-2">Onde aconteceu?</p>
                    <div className="w-full h-[250px] rounded-lg overflow-hidden">
                      <MapaDepoimentos hideMarkers={true} hideTitle={true} />
                    </div>
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
                        setDescription(e.target.value)
                        setValidationErrors({ ...validationErrors, description: false })
                      }}
                      className={`w-full bg-neutral-800 text-white p-3 rounded-md h-40 resize-none focus:outline-none focus:ring-2 ${
                        validationErrors.description ? 'ring-2 ring-red-400' : 'focus:ring-[#24BBE0]'
                      }`}
                    ></textarea>
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
