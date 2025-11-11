'use client';

import Navbar from "../components/navbar/navbar";
import { Merriweather } from "next/font/google";
import { useState, useMemo, useEffect } from "react";
import ReporterEthnicityBarChart from "../components/reporter-ethnicity-bar-chart/reporter-ethnicity-bar-chart";
import ReporterAgeGroupPieChart from "../components/reporter-demographics-pie-chart/reporter-age-group-pie-chart";
import ReporterGenderIdentityPieChart from "../components/reporter-demographics-pie-chart/reporter-gender-identity-pie-chart";
import ReporterSexualOrientationDistribution from "../components/reporter-sexual-orientation-distribution/reporter-sexual-orientation-distribution";
import CrimeTypeLineChart from "../components/crime-type-line-chart/crime-type-line-chart";
import CrimeNatureBarChart from "../components/crime-nature-bar-chart/crime-nature-bar-chart";
import { reportsClient, type ReportResponse } from "@/lib/api";
import { REGION_OPTIONS } from "@/lib/constants/regions";

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
    .replace(/\p{L}/u, c => c.toLocaleUpperCase("pt-BR"))
    .replace(/(\s+)(\p{L})/gu, (_, space, c) => space + c.toLocaleUpperCase("pt-BR"));
}

const normalizeText = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
};

const arraysEqual = <T,>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

type SelectedFilters = {
  crimeGenre: string;
  crimeTypes: string[];
  years: number[];
  regions: string[];
};

type MultiFilterKey = Extract<keyof SelectedFilters, "crimeTypes" | "years" | "regions">;

type CrimeTypeEntry = {
  label: string;
  options: string[];
};

type FilterKey = "crimeGenre" | "crimeTypes" | "regions" | "years";

const getCrimeTypesForGenre = (crimeGenre: string, mapping: Record<string, CrimeTypeEntry>) =>
  mapping[normalizeText(crimeGenre)]?.options ?? [];

const filterSelections = (current: string[], allowed: readonly string[]) => {
  if (!current.length) {
    return [];
  }

  const allowedSet = new Set(allowed.map(normalizeText));
  return current.filter(item => allowedSet.has(normalizeText(item)));
};

const findMatchingOption = (value: string | null | undefined, options: readonly string[]) => {
  if (!value) {
    return undefined;
  }

  return options.find(option => normalizeText(option) === normalizeText(value));
};


// COMPONENTE DE FILTRO 
interface FilterDropdownProps<T> {
  label: string;
  options: ReadonlyArray<T>;
  selected: T | T[];
  multi?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (option: T) => void;
  onSelectAll?: (selectAll: boolean) => void;
}

function FilterDropdown<T extends string | number>({
  label,
  options,
  selected,
  multi = false,
  open,
  onToggle,
  onSelect,
  onSelectAll,
}: FilterDropdownProps<T>) {
  const countSelected = Array.isArray(selected)
    ? selected.length
    : selected !== undefined && selected !== null && String(selected).length > 0
      ? 1
      : 0;
  const totalOptions = options.length;
  const isDisabled = totalOptions === 0;
  const selectedArray: T[] = Array.isArray(selected) ? selected : ([] as T[]);
  const areAllSelected = multi
    ? totalOptions > 0 && selectedArray.length === totalOptions && options.every(option => selectedArray.includes(option))
    : false;
  const buttonLabel = multi
    ? `${label} (${countSelected}/${totalOptions})`
    : countSelected > 0
      ? formatLabel(String(selected))
      : label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={!isDisabled ? onToggle : undefined}
        disabled={isDisabled}
        className={`w-full bg-[#373737] shadow-xl shadow-black/50 rounded-lg p-4 h-12 flex items-center justify-center text-white transition-colors ${isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-[#454545]'}`}
      >
        <div style={{ fontSize: "1.2rem" }}>{buttonLabel}</div>
      </button>

      {open && !isDisabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] border border-[#373737] rounded-lg shadow-xl shadow-black/50 z-10 max-h-48 overflow-y-auto">
          {multi && onSelectAll && (
            <button
              type="button"
              onClick={() => onSelectAll(!areAllSelected)}
              className="w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors first:rounded-t-lg"
            >
              {areAllSelected ? "Deselecionar Todos" : "Selecionar Todos"}
            </button>
          )}
          {options.map(option =>
            multi ? (
              <label
                key={option}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-white text-sm hover:bg-[#373737] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 bg-transparent border-[#555] rounded text-[#FF6384] focus:ring-0"
                  checked={selectedArray.includes(option)}
                  onChange={() => onSelect(option)}
                />
                {formatLabel(String(option))}
              </label>
            ) : (
              <button
                key={option}
                type="button"
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
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setIsLoading(true);
      try {
        const data = await reportsClient.getAllReports();
        if (!isMounted) {
          return;
        }
        setReports(data);
        setFetchError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as denúncias.';
        setFetchError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const crimeTypesByGenre = useMemo<Record<string, CrimeTypeEntry>>(() => {
    const mapping: Record<string, CrimeTypeEntry> = {};

    reports.forEach(report => {
      const genre = report.crimeGenre?.trim();
      const type = report.crimeType?.trim();
      if (!genre || !type) {
        return;
      }

      const key = normalizeText(genre);
      const existing = mapping[key];
      const entry: CrimeTypeEntry = existing ?? { label: genre, options: [] };

      if (!entry.options.includes(type)) {
        entry.options.push(type);
      }

      mapping[key] = entry;
    });

    Object.values(mapping).forEach(entry => {
      entry.options.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    });

    return mapping;
  }, [reports]);

  const crimeGenreOptions = useMemo(() => {
    const unique = new Map<string, string>();

    Object.values(crimeTypesByGenre).forEach(entry => {
      const key = normalizeText(entry.label);
      if (!unique.has(key)) {
        unique.set(key, entry.label);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
  }, [crimeTypesByGenre]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    reports.forEach(report => {
      const date = new Date(report.crimeDate);
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [reports]);

  const regionOptions = useMemo(() => {
    const map = new Map<string, string>();

    REGION_OPTIONS.forEach(region => {
      map.set(normalizeText(region), region);
    });

    reports.forEach(report => {
      const region = report.region?.trim();
      if (!region) {
        return;
      }

      const key = normalizeText(region);
      if (!map.has(key)) {
        map.set(key, region);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
  }, [reports]);

  useEffect(() => {
    const buildFilters = (previous: SelectedFilters | null): SelectedFilters => {
      if (!crimeGenreOptions.length) {
        return {
          crimeGenre: '',
          crimeTypes: [],
          years: [...yearOptions],
          regions: [...regionOptions],
        };
      }

      const defaultCrimeGenre = crimeGenreOptions[0];
      const matchedCrimeGenre = findMatchingOption(previous?.crimeGenre, crimeGenreOptions) ?? defaultCrimeGenre;
      const availableCrimeTypeList = [...getCrimeTypesForGenre(matchedCrimeGenre, crimeTypesByGenre)];
      const nextCrimeTypeSource = previous
        ? filterSelections(previous.crimeTypes, availableCrimeTypeList)
        : availableCrimeTypeList;
      const nextYearSource = previous
        ? previous.years.filter(year => yearOptions.includes(year))
        : yearOptions;
      const nextRegionSource = previous
        ? filterSelections(previous.regions, regionOptions)
        : regionOptions;
      const shouldKeepCrimeTypesEmpty = Boolean(previous && previous.crimeTypes.length === 0 && hasInteracted);
      const shouldKeepYearsEmpty = Boolean(previous && previous.years.length === 0 && hasInteracted);
      const shouldKeepRegionsEmpty = Boolean(previous && previous.regions.length === 0 && hasInteracted);

      return {
        crimeGenre: matchedCrimeGenre,
        crimeTypes: shouldKeepCrimeTypesEmpty
          ? []
          : nextCrimeTypeSource.length
            ? [...nextCrimeTypeSource]
            : availableCrimeTypeList,
        years: shouldKeepYearsEmpty
          ? []
          : nextYearSource.length
            ? [...nextYearSource]
            : [...yearOptions],
        regions: shouldKeepRegionsEmpty
          ? []
          : nextRegionSource.length
            ? [...nextRegionSource]
            : [...regionOptions],
      };
    };

    const nextFilters = buildFilters(selectedFilters);

    if (
      !selectedFilters ||
      selectedFilters.crimeGenre !== nextFilters.crimeGenre ||
      !arraysEqual(selectedFilters.crimeTypes, nextFilters.crimeTypes) ||
      !arraysEqual(selectedFilters.years, nextFilters.years) ||
      !arraysEqual(selectedFilters.regions, nextFilters.regions)
    ) {
      setSelectedFilters(nextFilters);
    }
  }, [crimeGenreOptions, crimeTypesByGenre, yearOptions, regionOptions, selectedFilters, hasInteracted]);

  const toggleSelection = <T,>(list: T[], option: T): T[] =>
    list.includes(option) ? list.filter(item => item !== option) : [...list, option];

  const toggleFilter = (name: FilterKey) => {
    setOpenFilter(current => (current === name ? null : name));
  };

  const handleCrimeSelect = (option: string) => {
    const matchedCrimeGenre = findMatchingOption(option, crimeGenreOptions) ?? option;
    const availableCrimeTypeList = [...getCrimeTypesForGenre(matchedCrimeGenre, crimeTypesByGenre)];

    setSelectedFilters(prev => {
      if (!prev) {
        return {
          crimeGenre: matchedCrimeGenre,
          crimeTypes: availableCrimeTypeList,
          years: [...yearOptions],
          regions: [...regionOptions],
        };
      }

      const nextCrimeTypes = filterSelections(prev.crimeTypes, availableCrimeTypeList);
      const nextYears = prev.years.filter(year => yearOptions.includes(year));
      const nextRegions = filterSelections(prev.regions, regionOptions);

      return {
        crimeGenre: matchedCrimeGenre,
        crimeTypes:
          prev.crimeTypes.length === 0
            ? []
            : nextCrimeTypes.length
              ? [...nextCrimeTypes]
              : availableCrimeTypeList,
        years:
          prev.years.length === 0
            ? []
            : nextYears.length
              ? [...nextYears]
              : [...yearOptions],
        regions:
          prev.regions.length === 0
            ? []
            : nextRegions.length
              ? [...nextRegions]
              : [...regionOptions],
      };
    });
    setOpenFilter(null);
  };

  function handleMultiSelect(filterName: MultiFilterKey, option: string | number) {
    setHasInteracted(true);
    setSelectedFilters(prev => {
      if (!prev) {
        return prev;
      }

      switch (filterName) {
        case "crimeTypes": {
          const updated = toggleSelection(prev.crimeTypes, option as string);
          return { ...prev, crimeTypes: updated };
        }
        case "regions": {
          const updated = toggleSelection(prev.regions, option as string);
          return { ...prev, regions: updated };
        }
        case "years": {
          const updated = toggleSelection(prev.years, option as number);
          return { ...prev, years: updated };
        }
        default:
          return prev;
      }
    });
  }

  function handleMultiSelectAll(filterName: MultiFilterKey, selectAll: boolean) {
    setHasInteracted(true);
    setSelectedFilters(prev => {
      if (!prev) {
        return prev;
      }

      switch (filterName) {
        case "crimeTypes":
          return { ...prev, crimeTypes: selectAll ? [...crimeTypeOptions] : [] };
        case "regions":
          return { ...prev, regions: selectAll ? [...regionOptions] : [] };
        case "years":
          return { ...prev, years: selectAll ? [...yearOptions] : [] };
        default:
          return prev;
      }
    });
  }

  const filteredData = useMemo<ReportResponse[]>(() => {
    if (!selectedFilters) {
      return [];
    }

    const normalizedCrimeGenre = normalizeText(selectedFilters.crimeGenre);
    const availableCrimeTypes = getCrimeTypesForGenre(selectedFilters.crimeGenre, crimeTypesByGenre);
    const selectedCrimeTypesSet = new Set(selectedFilters.crimeTypes.map(normalizeText));
    const selectedYearsSet = new Set(selectedFilters.years);
    const selectedRegionsSet = new Set(selectedFilters.regions.map(normalizeText));
    const shouldFilterCrimeTypes = availableCrimeTypes.length > 0;
    const shouldFilterYears = yearOptions.length > 0;
    const shouldFilterRegions = regionOptions.length > 0;
    const enforceCrimeTypes = shouldFilterCrimeTypes && selectedCrimeTypesSet.size > 0;
    const enforceYears = shouldFilterYears && selectedYearsSet.size > 0;
    const enforceRegions = shouldFilterRegions && selectedRegionsSet.size > 0;

    return reports.filter(report => {
      const date = new Date(report.crimeDate);
      const reportYear = Number.isNaN(date.getTime()) ? null : date.getFullYear();
      const reportCrimeType = report.crimeType?.trim();
      const reportRegion = report.region?.trim();

      const matchesCrimeGenre =
        !normalizedCrimeGenre || normalizeText(report.crimeGenre) === normalizedCrimeGenre;
      const matchesCrimeTypes =
        !shouldFilterCrimeTypes
          ? true
          : enforceCrimeTypes
            ? reportCrimeType
              ? selectedCrimeTypesSet.has(normalizeText(reportCrimeType))
              : false
            : false;
      const matchesYears =
        !shouldFilterYears
          ? true
          : enforceYears
            ? reportYear !== null && selectedYearsSet.has(reportYear)
            : false;
      const matchesRegions =
        !shouldFilterRegions
          ? true
          : enforceRegions
            ? reportRegion
              ? selectedRegionsSet.has(normalizeText(reportRegion))
              : false
            : false;

      return matchesCrimeGenre && matchesCrimeTypes && matchesYears && matchesRegions;
    });
  }, [reports, selectedFilters, crimeTypesByGenre, yearOptions, regionOptions]);

  if (!selectedFilters) {
    return (
      <div className={`${merriweather.className} h-screen flex flex-col bg-neutral-900`}>
        <Navbar />
        <main className="flex-1 text-white text-2xl pt-4 px-6 pb-6 overflow-hidden">
          <div className="flex h-full items-center justify-center text-lg">
            {fetchError ?? 'Carregando dados...'}
          </div>
        </main>
      </div>
    );
  }

  const crimeTypeOptions = getCrimeTypesForGenre(selectedFilters.crimeGenre, crimeTypesByGenre);
  const totalReports = filteredData.length;

  return (
    <div className={`${merriweather.className} h-screen flex flex-col bg-neutral-900`}>
      <Navbar />
      <main className="flex-1 text-white text-2xl pt-4 px-6 pb-6 overflow-hidden">
        <div className="w-full h-full">
          {(isLoading || fetchError) && (
            <div className="mb-4 space-y-2">
              {isLoading && (
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  Atualizando dados...
                </div>
              )}
              {fetchError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {fetchError}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            
            {/* --- Coluna Esquerda --- */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 flex flex-col justify-end items-center rounded-lg p-6 h-36">
                <p className="text-4xl font-bold">{totalReports}</p>
                <p>Total Denúncias</p>
              </div>

              <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex-1">
                <p>Distribuição por Natureza de Ocorrência</p>
                <CrimeNatureBarChart data={filteredData} />
              </div>
            </div>

            {/* --- Coluna Direita --- */}
            <div className="lg:col-span-3 flex gap-4">
              
              {/* Subcoluna Esquerda */}
              <div className="w-2/3 flex flex-col gap-4">
                
                {/* Filtros */}
                <div className="grid grid-cols-4 gap-4">
                  <FilterDropdown
                    label="Tipo"
                    options={crimeGenreOptions}
                    selected={selectedFilters.crimeGenre}
                    open={openFilter === "crimeGenre"}
                    onToggle={() => toggleFilter("crimeGenre")}
                    onSelect={handleCrimeSelect}
                  />
                  <FilterDropdown
                    label="Natureza"
                    options={crimeTypeOptions}
                    selected={selectedFilters.crimeTypes}
                    multi
                    open={openFilter === "crimeTypes"}
                    onToggle={() => toggleFilter("crimeTypes")}
                    onSelect={(option: string) => handleMultiSelect("crimeTypes", option)}
                    onSelectAll={(selectAll: boolean) => handleMultiSelectAll("crimeTypes", selectAll)}
                  />
                  <FilterDropdown
                    label="Região"
                    options={regionOptions}
                    selected={selectedFilters.regions}
                    multi
                    open={openFilter === "regions"}
                    onToggle={() => toggleFilter("regions")}
                    onSelect={(option: string) => handleMultiSelect("regions", option)}
                    onSelectAll={(selectAll: boolean) => handleMultiSelectAll("regions", selectAll)}
                  />
                  <FilterDropdown
                    label="Ano"
                    options={yearOptions}
                    selected={selectedFilters.years}
                    multi
                    open={openFilter === "years"}
                    onToggle={() => toggleFilter("years")}
                    onSelect={(option: number) => handleMultiSelect("years", option)}
                    onSelectAll={(selectAll: boolean) => handleMultiSelectAll("years", selectAll)}
                  />
                </div>

                {/* Gráfico Principal */}
                <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-75">
                  <p>Número de denúncias por mês</p>
                  <CrimeTypeLineChart data={filteredData} />
                </div>

                {/* Indicadores */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex flex-col">
                    <p className="text-white">Distribuição por Identidade de Gênero</p>
                    <div className="flex-1 w-full h-full">
                      <ReporterGenderIdentityPieChart data={filteredData} />
                    </div> 
                  </div>
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6">
                    <p>Distribuição por Orientação Sexual</p>
                    <ReporterSexualOrientationDistribution data={filteredData} />
                  </div>
                </div>
              </div> 

              {/* Subcoluna Direita */}
              <div className="w-1/3 flex flex-col gap-4">
                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 h-91 flex flex-col">
                    <p className="text-white">Distribuição por Faixa Etária</p>
                    <div className="flex-1 w-full h-full">
                      <ReporterAgeGroupPieChart data={filteredData} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid">
                  <div className="bg-[#1F1F1F] shadow-xl shadow-black/50 rounded-lg p-6 flex flex-col justify-between">
                    <p>Distribuição por Raça/Cor</p>
                    <div className="flex items-center justify-center">
                      <ReporterEthnicityBarChart data={filteredData} />
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
