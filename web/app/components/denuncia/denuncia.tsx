'use client'

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import MapaDepoimentos from "../map/map"

export default function DenunciaModal({ show, onCloseAction }: { show: boolean, onCloseAction: () => void }) {
  const [formStep, setFormStep] = useState(0)
  const [tipoRelato, setTipoRelato] = useState<string | null>(null)
  const [natureza, setNatureza] = useState<string | null>(null)
  const [dataOcorrencia, setDataOcorrencia] = useState("")
  const [resolvido, setResolvido] = useState<string | null>(null)
  const [faixaEtaria, setFaixaEtaria] = useState<string | null>(null)
  const [genero, setGenero] = useState<string | null>(null)
  const [orientacaoSexual, setOrientacaoSexual] = useState<string | null>(null)
  const [racaCor, setRacaCor] = useState<string | null>(null)

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setFormStep((prev) => Math.max(prev - 1, 0))
  }

  const goToHome = () => setFormStep(0)

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
                    <p className="font-semibold mb-2">Quando aconteceu?</p>
                    <input
                      type="text"
                      placeholder="DD / MM / YYYY"
                      value={dataOcorrencia}
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
                        setDataOcorrencia(input)
                      }}
                      maxLength={10}
                      className="bg-neutral-800 text-white p-2 rounded-md w-40 text-center focus:outline-none focus:ring-2 focus:ring-[#24BBE0]"
                    />
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
                      className="bg-[#24BBE0] hover:bg-blue-500 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
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
                    <p className="font-semibold mb-3">A situação já foi resolvida?</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "A", label: "Sim" },
                        { id: "B", label: "Não" },
                        { id: "C", label: "Não se aplica" },
                      ].map((item) => {
                        const selected = resolvido === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => setResolvido(item.label)}
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
                    {!resolvido && (
                      <p className="text-sm text-red-400 mt-2">
                        Por favor, selecione uma opção
                      </p>
                    )}
                  </div>

                  {/* Campo de depoimento */}
                  <div>
                    <p className="font-semibold mb-2">Depoimento</p>
                    <textarea
                      placeholder="Descreva aqui ..."
                      className="w-full bg-neutral-800 text-white p-3 rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-[#24BBE0]"
                    ></textarea>
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
                        const selected = faixaEtaria === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => setFaixaEtaria(item.label)}
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
                        const selected = genero === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => setGenero(item.label)}
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

                <form className="flex flex-col gap-8" onSubmit={nextStep}>
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
                        const selected = orientacaoSexual === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => setOrientacaoSexual(item.label)}
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
                        const selected = racaCor === item.label
                        return (
                          <button
                            type="button"
                            key={item.label}
                            onClick={() => setRacaCor(item.label)}
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
                      className="bg-[#FF7A00] hover:bg-[#c36003] text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                    >
                      Enviar <FaArrowRight />
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
              </>
            )}



            {/* Botão de fechar */}
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
