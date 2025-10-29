import Navbar from "../components/navbar/navbar";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});

export default function DashboardPage() {
  return (
    // Estrutura principal para ocupar a tela inteira sem scroll
    <div className="h-screen flex flex-col bg-neutral-900">
      <Navbar />
      <main className="flex-1 text-white pt-4 px-6 pb-6 overflow-hidden">
        <div className="w-full h-full">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">

            {/* --- Coluna da Esquerda (sem alterações) --- */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-36 flex items-center justify-center">
                <p className="text-white"></p>
              </div>
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex-1 flex items-center justify-center">
                <p className="text-white"></p>
              </div>
            </div>

            {/* --- Coluna da Direita (COM A NOVA ESTRUTURA) --- */}
            <div className="lg:col-span-3 flex gap-4">
              
              {/* Sub-coluna Esquerda (2/3 da largura) */}
              <div className="w-2/3 flex flex-col gap-4">
                {/* Filtros Principais */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center">
                    <p className="text-white">Crime</p>
                  </div>
                  <div className="bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center">
                    <p className="text-white">Natureza</p>
                  </div>
                  <div className="bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center">
                    <p className="text-white">Região</p>
                  </div>
                </div>
                {/* Gráfico Principal */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-56 flex items-center justify-center">
                  <p className="text-white"></p>
                </div>
                {/* Indicadores 1 e 2 (crescem para preencher) */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex items-center justify-center">
                    <p className="text-white"></p>
                  </div>
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex items-center justify-center">
                    <p className="text-white"></p>
                  </div>
                </div>
              </div>

              {/* Sub-coluna Direita (1/3 da largura) */}
              <div className="w-1/3 flex flex-col gap-4">
                {/* Visualização Secundária (altura calculada para alinhar) */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-[18rem] flex items-center justify-center">
                  <p className="text-white"></p>
                </div>
                {/* Indicador 3 (cresce para preencher) */}
                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex items-center justify-center">
                    <p className="text-white"></p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}