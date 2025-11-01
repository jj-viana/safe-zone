'use client';

import Navbar from "../components/navbar/navbar";
import { Merriweather } from "next/font/google";
import { useState, useMemo, useEffect } from "react";
import GraficodeBarras from "../components/graficoBarras/graficoBarras";
import GraficoPizza from "../components/graficoPizza/graficoPizza";
import GraficoDistribuicao from "../components/graficoDistribuicao/GraficoDistribuicao";
import GraficoDeLinha from "../components/graficoLinha/graficolinha";
import GraficoNatureza from "../components/graficoNatureza.tsx/graficoNatureza";
import { MOCK_CRIME_DATA } from "./data/mockData";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});

function formatLabel(text: string): string {
  if (!text) return "";
  if (text === "crime") return "Crime";
  if (text === "sensacao_inseguranca") return "Sensação de Insegurança";

  return text
    .replace(/_/g, " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/\p{L}/u, c => c.toLocaleUpperCase("pt-BR")) // Primeira letra da string
    .replace(/(\s+)(\p{L})/gu, (_, space, c) => space + c.toLocaleUpperCase("pt-BR")); // Primeira letra após cada espaço
}

// COMPONENTE DE FILTRO 
interface FiltroDropdownProps<T> {
  label: string;
  options: T[];
  selected: T | T[];
  multi?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (option: T) => void;
}

function FiltroDropdown<T extends string | number>({
  label,
  options,
  selected,
  multi = false,
  open,
  onToggle,
  onSelect,
}: FiltroDropdownProps<T>) {
  const countSelected = Array.isArray(selected) ? selected.length : 1;
  const totalOptions = options.length;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center text-white hover:bg-[#454545] transition-colors"
      >
        <div style={{ fontSize: "1.2rem" }}>
          {multi
            ? `${label} (${countSelected}/${totalOptions})`
            : formatLabel(selected as string)}
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] border border-[#373737] rounded-lg shadow-xl shadow-black/50 z-10 max-h-48 overflow-y-auto">
          {options.map(option =>
            multi ? (
              <label
                key={option}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 bg-transparent border-[#555] rounded text-[#FF6384] focus:ring-0"
                  checked={(selected as T[]).includes(option)}
                  onChange={() => onSelect(option)}
                />
                {formatLabel(String(option))}
              </label>
            ) : (
              <button
                key={option}
                onClick={() => onSelect(option)}
                className="w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors first:rounded-t-lg last:rounded-b-lg capitalize"
              >
                {formatLabel(String(option))}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

//  COMPONENTE PRINCIPAL 
export default function DashboardPage() {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // opções fixas
  const naturezaPorCrime: Record<string, string[]> = {
    crime: [
      "Assalto",
      "Violência Verbal",
      "Violência Física",
      "Furto",
      "Vandalismo",
      "Assédio",
    ],
    sensacao_inseguranca: [
      "Iluminação precária",
      "Abandono de local público",
    ],
  };

  const crimeOptions = ["crime", "sensacao_inseguranca"];
  const anoOptions = [...new Set(MOCK_CRIME_DATA.map(i => new Date(i.crimeDate).getFullYear()))];
  const regiaoOptions = ["Plano Piloto", "Taguatinga", "Águas Claras", "Guará", "Ceilândia"];

  const [selectedFilters, setSelectedFilters] = useState({
    crime: "crime",
    natureza: naturezaPorCrime["crime"],
    ano: anoOptions,
    regiao: regiaoOptions,
  });

  // Atualiza naturezas automaticamente quando muda "crime"
  useEffect(() => {
    setSelectedFilters(prev => ({
      ...prev,
      natureza: naturezaPorCrime[prev.crime],
    }));
  }, [selectedFilters.crime]);

  const toggleFilter = (name: string) => {
    setOpenFilter(openFilter === name ? null : name);
  };

  const handleSingleSelect = (filterName: string, option: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: option,
    }));
    setOpenFilter(null);
  };

  const handleMultiSelect = (
    filterName: keyof Omit<typeof selectedFilters, "crime">,
    option: string | number
  ) => {
    const current = selectedFilters[filterName];
    const newSelection = (current as any).includes(option)
      ? (current as any).filter((i: any) => i !== option)
      : [...(current as any), option];
    setSelectedFilters({ ...selectedFilters, [filterName]: newSelection });
  };

  //  filtragem 
  const filteredData = useMemo(() => {
    return MOCK_CRIME_DATA.filter(item => {
      const year = new Date(item.crimeDate).getFullYear();
      const crimeMatch = item.crimeGenre === selectedFilters.crime;
      const naturezaMatch = selectedFilters.natureza.includes(item.crimeType);
      const anoMatch = selectedFilters.ano.includes(year);
      return crimeMatch && naturezaMatch && anoMatch;
    });
  }, [selectedFilters]);

  const totalDenuncias = filteredData.length;

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      <Navbar />
      <main className="flex-1 text-white text-2xl pt-4 px-6 pb-6 overflow-hidden">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            
            {/* --- Coluna Esquerda --- */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 flex flex-col justify-end items-center rounded-lg p-6 h-36">
                <p className="text-4xl font-bold">{totalDenuncias}</p>
                <p>Total Denúncias</p>
              </div>

              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex-1">
                <p>Distribuição por Natureza de Ocorrência</p>
                <GraficoNatureza data={filteredData} />
              </div>
            </div>

            {/* --- Coluna Direita --- */}
            <div className="lg:col-span-3 flex gap-4">
              
              {/* Subcoluna Esquerda */}
              <div className="w-2/3 flex flex-col gap-4">
                
                {/* Filtros */}
                <div className="grid grid-cols-4 gap-4">
                  <FiltroDropdown
                    label="Tipo"
                    options={crimeOptions}
                    selected={selectedFilters.crime}
                    open={openFilter === "crime"}
                    onToggle={() => toggleFilter("crime")}
                    onSelect={option => handleSingleSelect("crime", option)}
                  />
                  <FiltroDropdown
                    label="Natureza"
                    options={naturezaPorCrime[selectedFilters.crime]}
                    selected={selectedFilters.natureza}
                    multi
                    open={openFilter === "natureza"}
                    onToggle={() => toggleFilter("natureza")}
                    onSelect={option => handleMultiSelect("natureza", option)}
                  />
                  <FiltroDropdown
                    label="Região"
                    options={regiaoOptions}
                    selected={selectedFilters.regiao}
                    multi
                    open={openFilter === "regiao"}
                    onToggle={() => toggleFilter("regiao")}
                    onSelect={option => handleMultiSelect("regiao", option)}
                  />
                  <FiltroDropdown
                    label="Ano"
                    options={anoOptions}
                    selected={selectedFilters.ano}
                    multi
                    open={openFilter === "ano"}
                    onToggle={() => toggleFilter("ano")}
                    onSelect={option => handleMultiSelect("ano", option)}
                  />
                </div>

                {/* Gráfico Principal */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-75">
                  <p>Número de denúncias por mês</p>
                  <GraficoDeLinha data={filteredData} />
                </div>

                {/* Indicadores */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex flex-col">
                    <p className="text-white">Distribuição por Identidade de Gênero</p>
                    <div className="flex-1 w-full h-full">
                      <GraficoPizzaGenero />
                    </div>
                  </div>
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6">
                    <p>Distribuição por Orientação Sexual</p>
                    <GraficoDistribuicao data={filteredData} />
                  </div>
                </div>
              </div>

              {/* Subcoluna Direita */}
              <div className="w-1/3 flex flex-col gap-4">
                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-91 flex flex-col">
                    <p className="text-white">Distribuição por Faixa Etária</p>
                    <div className="flex-1 w-full h-full">
                      <GraficoPizza />
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex flex-col justify-between">
                    <p>Distribuição por Raça/Cor</p>
                    <div className="flex items-center justify-center">
                      <GraficodeBarras data={filteredData} />
                    </div>
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
