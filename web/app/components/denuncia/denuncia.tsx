'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { FaArrowRight } from "react-icons/fa"

export default function DenunciaModal({ show, onCloseAction }: { show: boolean, onCloseAction: () => void }) {
  const [formStep, setFormStep] = useState(0)
  const [tipoRelato, setTipoRelato] = useState<string | null>(null)
  const [natureza, setNatureza] = useState<string | null>(null)

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setFormStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSelect = (value: string, setter: (val: string) => void) => {
    setter(value)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { onCloseAction(); setFormStep(0) }}
        >
          <motion.div
            className="bg-neutral-900 p-8 rounded-2xl w-[700px] text-white relative flex flex-col items-center border border-[#24BBE0]/30 shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/raposa.svg"
              alt="Raposa"
              className="w-20 h-20 mb-4"
            />

            {formStep === 0 && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center">Denúncia Aqui!</h2>
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
                <p className="mb-4 text-center">O envio é totalmente anônimo e seguro.</p>

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

            {formStep === 1 && (
              <>
                <div className="w-full">
                  {/* Voltar */}
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm text-gray-400 mb-2 hover:text-white text-left"
                  >
                    ← Página Inicial
                  </button>

                  <h2 className="text-3xl font-bold mb-6 text-center">Informações básicas</h2>

                  <form className="flex flex-col gap-6" onSubmit={nextStep}>
                    <div>
                      <p className="font-semibold mb-3">Seu relato é sobre?</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "A", label: "Crime" },
                          { id: "B", label: "Sensação de insegurança" },
                        ].map((item) => {
                          const selected = tipoRelato === item.label
                          return (
                            <button
                              type="button"
                              key={item.label}
                              onClick={() => handleSelect(item.label, setTipoRelato)}
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
                      <p className="font-semibold mb-3">Qual é a natureza da ocorrência?</p>
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
                          const selected = natureza === item.label
                          return (
                            <button
                              type="button"
                              key={item.label}
                              onClick={() => handleSelect(item.label, setNatureza)}
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

                    <button
                      type="submit"
                      className="mt-6 bg-[#24BBE0] hover:bg-blue-500 text-white p-2 rounded font-semibold flex items-center justify-center gap-2 self-center w-40"
                    >
                      Próximo <FaArrowRight />
                    </button>
                  </form>
                </div>
              </>
            )}

            <button
              className="absolute top-2 right-2 hover:text-white text-gray-400"
              onClick={() => { onCloseAction(); setFormStep(0) }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
