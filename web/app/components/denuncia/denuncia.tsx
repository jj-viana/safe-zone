'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { FaArrowRight } from "react-icons/fa"

export default function DenunciaModal({ show, onCloseAction }: { show: boolean, onCloseAction: () => void }) {
  const [formStep, setFormStep] = useState(0)

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStep((prev) => prev + 1)
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
            className="bg-neutral-800 p-8 rounded-xl w-150 text-white relative flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem acima do título */}
            <img
              src="/raposa.svg"
              alt="Raposa"
              className="w-20 h-20 mb-4"
            />

            <h2 className="text-2xl font-bold mb-2 text-center">Denúncia Aqui!</h2>
            <p className="text-[#24BBE0] mb-4 text-center">Nos fale um pouco sobre o que você está passando!</p>

            {formStep === 0 && (
              <>
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
                <form className="flex flex-col gap-3 w-full" onSubmit={(e) => e.preventDefault()}>
                  <label className="text-center">Digite mais detalhes sobre sua denúncia:</label>
                  <textarea className="p-2 rounded w-full" placeholder="Escreva aqui..." />
                  <button
                    type="submit"
                    className="bg-[#24BBE0] hover:bg-blue-500 p-2 rounded font-semibold flex items-center justify-center gap-2"
                    onClick={() => { onCloseAction(); setFormStep(0) }}
                  >
                    Enviar
                  </button>
                </form>
              </>
            )}

            {/* Botão de fechar */}
            <button
              className="absolute top-2 right-2 hover:text-white"
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
