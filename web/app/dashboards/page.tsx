'use client';

import Navbar from "../components/navbar/navbar";
import { Merriweather } from "next/font/google";
import { useState } from "react";


const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});

export default function DashboardPage() {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    crime: "Crime",
    natureza: "Natureza",
    regiao: "Região",
  });

  const filterOptions = {
    crime: ["Crime", "Sensação de Insegurança"],
    natureza: ["Assalto ou tentativa de assalto", "Violência Verbal", "Violência Física", "Furto", "Vandalismo", "Assédio", "Iluminação Precária", "Abandono de local público"],
    regiao: ["Todas", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
  };

  const handleFilterClick = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const handleSelectOption = (filterName: string, option: string) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterName]: option,
    });
    setOpenFilter(null);
  };

  const calculateFontSize = (text: string) => {
    if (text.length > 30) return "1rem";
    if (text.length > 20) return "1.2rem";
    if (text.length > 15) return "1.3rem";
    return "1.4rem";
  };

  return (
    // Estrutura principal para ocupar a tela inteira sem scroll
    <div className="h-screen flex flex-col bg-neutral-900">
      <Navbar />
      <main className="flex-1 text-white text-2xl pt-4 px-6 pb-6 overflow-hidden">
        <div className="w-full h-full">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">

            {/* --- Coluna da Esquerda --- */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Classes de centralização removidas */}
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 flex flex-col justify-end items-center rounded-lg p-6 h-36">
                <p className="text-white text-5xl font-bold">3.276</p>
                <p className="text-white ">Total Denúncias</p>
              </div>
              {/* Classes de centralização removidas */}
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex-1">
                <p className="text-white">Distribuição por Natureza de Ocorrência</p>
              </div>
            </div>

            {/* --- Coluna da Direita --- */}
            <div className="lg:col-span-3 flex gap-4">
              
              {/* Sub-coluna Esquerda (2/3 da largura) */}
              <div className="w-2/3 flex flex-col gap-4">
                {/* Filtros Principais com Dropdown */}
                <div className="grid grid-cols-3 gap-4 relative">
                  {/* Botão Crime */}
                  <div className="relative">
                    <button
                      onClick={() => handleFilterClick("crime")}
                      className="w-full bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center text-white hover:bg-[#454545] transition-colors"
                    >
                      <div style={{ fontSize: calculateFontSize(selectedFilters.crime) }}>
                        {selectedFilters.crime}
                      </div>
                    </button>
                    {openFilter === "crime" && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] border border-[#373737] rounded-lg shadow-xl shadow-black/50 z-10">
                        {filterOptions.crime.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelectOption("crime", option)}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botão Natureza */}
                  <div className="relative">
                    <button
                      onClick={() => handleFilterClick("natureza")}
                      className="w-full bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center text-white hover:bg-[#454545] transition-colors"
                    >
                      <div style={{ fontSize: calculateFontSize(selectedFilters.natureza) }}>
                        {selectedFilters.natureza}
                      </div>
                    </button>
                    {openFilter === "natureza" && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] border border-[#373737] rounded-lg shadow-xl shadow-black/50 z-10 max-h-48 overflow-y-auto">
                        {filterOptions.natureza.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelectOption("natureza", option)}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botão Região */}
                  <div className="relative">
                    <button
                      onClick={() => handleFilterClick("regiao")}
                      className="w-full bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center text-white hover:bg-[#454545] transition-colors"
                    >
                      <div style={{ fontSize: calculateFontSize(selectedFilters.regiao) }}>
                        {selectedFilters.regiao}
                      </div>
                    </button>
                    {openFilter === "regiao" && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] border border-[#373737] rounded-lg shadow-xl shadow-black/50 z-10">
                        {filterOptions.regiao.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelectOption("regiao", option)}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Gráfico Principal - Classes de centralização removidas */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-56">
                  <p className="text-white">Número de denúncias por mês</p>
                </div>
                {/* Indicadores 1 e 2 - Classes de centralização removidas */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6">
                    <p className="text-white">Distribuição por Identidade de Gênero</p>
                  </div>
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6">
                    <p className="text-white">Distribuição por Orientação Sexual</p>
                  </div>
                </div>
              </div>

              {/* Sub-coluna Direita (1/3 da largura) */}
              <div className="w-1/3 flex flex-col gap-4">
                {/* Visualização Secundária - Classes de centralização removidas */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-[18rem]">
                  <p className="text-white">Distribuição por Faixa Etária</p>
                </div>
                {/* Indicador 3 - Classes de centralização removidas */}
                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6">
                    <p className="text-white">Distribuição por Raça/Cor</p>
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