'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/navbar/navbar';
import { reportsClient, type ReportResponse } from '@/lib/api';
import { getStatusLabel, normalizeStatusValue } from '@/lib/utils/status-utils';
import { formatUtcDateInSaoPaulo } from '@/lib/utils/date-utils';

const STATUS_TABS = [
  { value: 'Draft', label: getStatusLabel('Draft', { plural: true }) },
  { value: 'Approved', label: getStatusLabel('Approved', { plural: true }) },
  { value: 'Denied', label: getStatusLabel('Denied', { plural: true }) },
] as const;

const REPORTS_PAGE_SIZE = 9;

type StatusTabValue = (typeof STATUS_TABS)[number]['value'];

type SelectedFilters = {
  crimeGenre: string;
  crimeTypes: string[];
  regions: string[];
  years: number[];
};

type ActionFeedback = {
  type: 'success' | 'error';
  message: string;
};

const createInitialFilters = (): SelectedFilters => ({
  crimeGenre: '',
  crimeTypes: [],
  regions: [],
  years: [],
});

const normalizeText = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');

const normalizeStatus = (status: string) => normalizeStatusValue(status);

const parseYear = (value: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getFullYear();
};

const arraysEqual = <T,>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const getCrimeTypesForGenre = (
  genre: string,
  mapping: Record<string, string[]>,
  fallback: string[],
) => {
  if (!genre) {
    return fallback;
  }

  const key = normalizeText(genre);
  return mapping[key] ?? fallback;
};

const formatDate = (value: string) => formatUtcDateInSaoPaulo(value);

const pillClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition-colors ${
    active
      ? 'border-[#24BBE0] bg-[#24BBE0]/10 text-[#24BBE0]'
      : 'border-neutral-700 text-neutral-200 hover:border-[#24BBE0]/60 hover:text-white'
  }`;

export default function AdminPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusTabValue>('Draft');
  const [filters, setFilters] = useState<SelectedFilters>(() => createInitialFilters());
  const [visibleCount, setVisibleCount] = useState(REPORTS_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

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

  useEffect(() => {
    setFilters(createInitialFilters());
    setSelectedReport(null);
    setActionFeedback(null);
    setVisibleCount(REPORTS_PAGE_SIZE);
  }, [statusFilter]);

  const normalizedStatusFilter = useMemo(
    () => normalizeStatus(statusFilter),
    [statusFilter],
  );

  const reportsByStatus = useMemo(
    () =>
      reports.filter(
        report => normalizeStatus(report.status) === normalizedStatusFilter,
      ),
    [reports, normalizedStatusFilter],
  );

  const crimeTypesByGenre = useMemo(() => {
    const mapping: Record<string, string[]> = {};

    reportsByStatus.forEach(report => {
      const genre = report.crimeGenre?.trim();
      const type = report.crimeType?.trim();
      if (!genre || !type) {
        return;
      }

      const key = normalizeText(genre);
      const existing = mapping[key];
      if (existing) {
        if (!existing.some(option => normalizeText(option) === normalizeText(type))) {
          existing.push(type);
        }
      } else {
        mapping[key] = [type];
      }
    });

    Object.values(mapping).forEach(list =>
      list.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })),
    );

    return mapping;
  }, [reportsByStatus]);

  const crimeGenreOptions = useMemo(() => {
    const unique = new Map<string, string>();

    reportsByStatus.forEach(report => {
      const genre = report.crimeGenre?.trim();
      if (!genre) {
        return;
      }

      const key = normalizeText(genre);
      if (!unique.has(key)) {
        unique.set(key, genre);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [reportsByStatus]);

  const allCrimeTypes = useMemo(() => {
    const unique = new Map<string, string>();

    reportsByStatus.forEach(report => {
      const type = report.crimeType?.trim();
      if (!type) {
        return;
      }

      const key = normalizeText(type);
      if (!unique.has(key)) {
        unique.set(key, type);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [reportsByStatus]);

  const availableCrimeTypes = useMemo(
    () => getCrimeTypesForGenre(filters.crimeGenre, crimeTypesByGenre, allCrimeTypes),
    [filters.crimeGenre, crimeTypesByGenre, allCrimeTypes],
  );

  const regionOptions = useMemo(() => {
    const unique = new Map<string, string>();

    reportsByStatus.forEach(report => {
      const region = report.region?.trim();
      if (!region) {
        return;
      }

      const key = normalizeText(region);
      if (!unique.has(key)) {
        unique.set(key, region);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [reportsByStatus]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();

    reportsByStatus.forEach(report => {
      const year = parseYear(report.crimeDate);
      if (year) {
        years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => a - b);
  }, [reportsByStatus]);

  useEffect(() => {
    setFilters(prev => {
      const nextCrimeGenre = prev.crimeGenre
        ? crimeGenreOptions.find(
            option => normalizeText(option) === normalizeText(prev.crimeGenre),
          ) ?? ''
        : '';

      const allowedCrimeTypes = getCrimeTypesForGenre(
        nextCrimeGenre,
        crimeTypesByGenre,
        allCrimeTypes,
      );

      const nextCrimeTypes = prev.crimeTypes.filter(type =>
        allowedCrimeTypes.some(
          option => normalizeText(option) === normalizeText(type),
        ),
      );

      const nextRegions = prev.regions.filter(region =>
        regionOptions.some(
          option => normalizeText(option) === normalizeText(region),
        ),
      );

      const nextYears = prev.years.filter(year => yearOptions.includes(year));

      if (
        nextCrimeGenre === prev.crimeGenre &&
        arraysEqual(prev.crimeTypes, nextCrimeTypes) &&
        arraysEqual(prev.regions, nextRegions) &&
        arraysEqual(prev.years, nextYears)
      ) {
        return prev;
      }

      return {
        crimeGenre: nextCrimeGenre,
        crimeTypes: nextCrimeTypes,
        regions: nextRegions,
        years: nextYears,
      };
    });
  }, [crimeGenreOptions, crimeTypesByGenre, allCrimeTypes, regionOptions, yearOptions]);

  const filteredReports = useMemo(() => {
    if (!filters.crimeGenre &&
      filters.crimeTypes.length === 0 &&
      filters.regions.length === 0 &&
      filters.years.length === 0
    ) {
      return reportsByStatus;
    }

    return reportsByStatus.filter(report => {
      if (filters.crimeGenre) {
        if (normalizeText(report.crimeGenre) !== normalizeText(filters.crimeGenre)) {
          return false;
        }
      }

      if (filters.crimeTypes.length > 0) {
        const reportType = normalizeText(report.crimeType);
        const matchesType = filters.crimeTypes.some(
          type => normalizeText(type) === reportType,
        );
        if (!matchesType) {
          return false;
        }
      }

      if (filters.regions.length > 0) {
        const reportRegion = normalizeText(report.region);
        const matchesRegion = filters.regions.some(
          region => normalizeText(region) === reportRegion,
        );
        if (!matchesRegion) {
          return false;
        }
      }

      if (filters.years.length > 0) {
        const year = parseYear(report.crimeDate);
        if (!year || !filters.years.includes(year)) {
          return false;
        }
      }

      return true;
    });
  }, [reportsByStatus, filters]);

  const visibleReports = useMemo(
    () => filteredReports.slice(0, visibleCount),
    [filteredReports, visibleCount],
  );

  const handleCrimeGenreChange = (value: string) => {
    setFilters(prev => {
      if (normalizeText(prev.crimeGenre) === normalizeText(value)) {
        return prev;
      }

      const allowedCrimeTypes = getCrimeTypesForGenre(
        value,
        crimeTypesByGenre,
        allCrimeTypes,
      );

      const nextCrimeTypes = prev.crimeTypes.filter(type =>
        allowedCrimeTypes.some(
          option => normalizeText(option) === normalizeText(type),
        ),
      );

      return {
        ...prev,
        crimeGenre: value,
        crimeTypes: nextCrimeTypes,
      };
    });
    setVisibleCount(REPORTS_PAGE_SIZE);
  };

  const toggleCrimeType = (value: string) => {
    setFilters(prev => {
      const normalizedValue = normalizeText(value);
      const exists = prev.crimeTypes.some(
        item => normalizeText(item) === normalizedValue,
      );

      return {
        ...prev,
        crimeTypes: exists
          ? prev.crimeTypes.filter(
              item => normalizeText(item) !== normalizedValue,
            )
          : [...prev.crimeTypes, value],
      };
    });
    setVisibleCount(REPORTS_PAGE_SIZE);
  };

  const toggleRegion = (value: string) => {
    setFilters(prev => {
      const normalizedValue = normalizeText(value);
      const exists = prev.regions.some(
        item => normalizeText(item) === normalizedValue,
      );

      return {
        ...prev,
        regions: exists
          ? prev.regions.filter(
              item => normalizeText(item) !== normalizedValue,
            )
          : [...prev.regions, value],
      };
    });
    setVisibleCount(REPORTS_PAGE_SIZE);
  };

  const toggleYear = (value: number) => {
    setFilters(prev => {
      const exists = prev.years.includes(value);
      return {
        ...prev,
        years: exists
          ? prev.years.filter(year => year !== value)
          : [...prev.years, value],
      };
    });
    setVisibleCount(REPORTS_PAGE_SIZE);
  };

  const clearFilters = () => {
    setFilters(createInitialFilters());
    setVisibleCount(REPORTS_PAGE_SIZE);
  };

  const openReportDetails = (report: ReportResponse) => {
    setSelectedReport(report);
    setActionFeedback(null);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setIsActionLoading(false);
    setActionFeedback(null);
  };

  const handleStatusChange = async (report: ReportResponse, nextStatus: StatusTabValue) => {
    setIsActionLoading(true);
    setActionFeedback(null);

    try {
      const updated = await reportsClient.updateReportStatus(report.id, nextStatus);
      setReports(prev =>
        prev.map(item => (item.id === updated.id ? updated : item)),
      );

      if (normalizeStatus(updated.status) !== normalizedStatusFilter) {
        setSelectedReport(null);
      } else {
        setSelectedReport(updated);
      }

      setActionFeedback({
        type: 'success',
        message: `Status alterado para ${getStatusLabel(nextStatus)}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o status.';
      setActionFeedback({ type: 'error', message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderFilterGroup = (
    title: string,
    options: readonly string[],
    selected: readonly string[],
    onToggle: (value: string) => void,
  ) => (
    <div className="space-y-3">
      <span className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.length === 0 ? (
          <span className="text-sm text-neutral-500">Nenhuma opção disponível</span>
        ) : (
          options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={pillClass(
                selected.some(
                  item => normalizeText(item) === normalizeText(option),
                ),
              )}
            >
              {option}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-12">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Área Administrativa</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Gerencie denúncias por status, visualize detalhes e aprove ou negue solicitações pendentes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-neutral-900 p-1">
              {STATUS_TABS.map(tab => {
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-full px-5 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-[#24BBE0] text-black shadow-lg shadow-[#24BBE0]/30'
                        : 'text-neutral-300 hover:bg-[#24BBE0]/10 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <span className="text-sm text-neutral-500">
              Total: {reportsByStatus.length}
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-200">Filtros</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-[#24BBE0] transition-colors hover:text-[#24BBE0]/80"
            >
              Limpar filtros
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Gênero do crime
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCrimeGenreChange('')}
                  className={pillClass(!filters.crimeGenre)}
                >
                  Todos
                </button>
                {crimeGenreOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCrimeGenreChange(option)}
                    className={pillClass(
                      Boolean(
                        filters.crimeGenre &&
                          normalizeText(filters.crimeGenre) === normalizeText(option),
                      ),
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {renderFilterGroup('Tipos de crime', availableCrimeTypes, filters.crimeTypes, toggleCrimeType)}
            {renderFilterGroup('Regiões', regionOptions, filters.regions, toggleRegion)}

            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Ano do crime
              </span>
              <div className="flex flex-wrap gap-2">
                {yearOptions.length === 0 ? (
                  <span className="text-sm text-neutral-500">Nenhum ano disponível</span>
                ) : (
                  yearOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleYear(option)}
                      className={pillClass(filters.years.includes(option))}
                    >
                      {option}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {actionFeedback && !selectedReport && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              actionFeedback.type === 'success'
                ? 'border-green-500/40 bg-green-500/10 text-green-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {actionFeedback.message}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-[#24BBE0] animate-spin" />
            <span className="text-sm text-neutral-400">Carregando denúncias...</span>
          </div>
        ) : fetchError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center text-sm text-red-300">
            {fetchError}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-xl border border-neutral-900 bg-neutral-900/60 p-12 text-center text-neutral-400">
            Nenhuma denúncia encontrada com os filtros selecionados.
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleReports.map(report => {
              const crimeYear = parseYear(report.crimeDate);
              return (
                <article
                  key={report.id}
                  className="flex h-full flex-col justify-between rounded-2xl border border-neutral-900 bg-neutral-900/80 p-6 shadow-lg shadow-black/20"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-white">
                          {report.crimeType || 'Tipo não informado'}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {report.crimeGenre || 'Gênero não informado'}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#24BBE0]/40 bg-[#24BBE0]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#24BBE0]">
                        {getStatusLabel(report.status)}
                      </span>
                    </div>

                    <p className="text-sm text-neutral-300">
                      {report.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span className="rounded-full bg-neutral-800 px-3 py-1">
                      {report.region || 'Região não informada'}
                    </span>
                    <span className="rounded-full bg-neutral-800 px-3 py-1">
                      {report.location || 'Localização não informada'}
                    </span>
                    {crimeYear && (
                      <span className="rounded-full bg-neutral-800 px-3 py-1">
                        {crimeYear}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openReportDetails(report)}
                    className="mt-6 w-full rounded-xl bg-[#24BBE0] py-2 text-sm font-semibold text-black transition-colors hover:bg-[#1EA4C6]"
                  >
                    Ver detalhes
                  </button>
                </article>
              );
            })}
          </section>
        )}

        {visibleCount < filteredReports.length && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount(prev => Math.min(prev + REPORTS_PAGE_SIZE, filteredReports.length))
              }
              className="rounded-xl border border-[#24BBE0]/60 px-6 py-2 text-sm font-semibold text-[#24BBE0] transition-colors hover:border-[#24BBE0] hover:text-white"
            >
              Carregar mais
            </button>
          </div>
        )}
      </main>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          onClick={closeReportDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Detalhes da denúncia</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  ID: {selectedReport.id}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReportDetails}
                className="text-2xl font-bold text-neutral-500 transition-colors hover:text-white"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Gênero do crime
                </span>
                <p className="text-sm text-neutral-100">
                  {selectedReport.crimeGenre || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Tipo de crime
                </span>
                <p className="text-sm text-neutral-100">
                  {selectedReport.crimeType || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Região
                </span>
                <p className="text-sm text-neutral-100">
                  {selectedReport.region || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Localização
                </span>
                <p className="text-sm text-neutral-100 break-words">
                  {selectedReport.location || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Data do crime
                </span>
                <p className="text-sm text-neutral-100">
                  {formatDate(selectedReport.crimeDate)}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Data de criação
                </span>
                <p className="text-sm text-neutral-100">
                  {formatDate(selectedReport.createdDate)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Descrição
              </span>
              <p className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 text-sm text-neutral-100">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.reporterDetails && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-semibold text-neutral-300">Informações do denunciante</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      Faixa etária
                    </span>
                    <p className="text-sm text-neutral-100">
                      {selectedReport.reporterDetails.ageGroup || 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      Etnia
                    </span>
                    <p className="text-sm text-neutral-100">
                      {selectedReport.reporterDetails.ethnicity || 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      Identidade de gênero
                    </span>
                    <p className="text-sm text-neutral-100">
                      {selectedReport.reporterDetails.genderIdentity || 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      Orientação sexual
                    </span>
                    <p className="text-sm text-neutral-100">
                      {selectedReport.reporterDetails.sexualOrientation || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Status atual: <span className="text-sm text-neutral-100">{getStatusLabel(selectedReport.status)}</span>
              </span>

              <div className="flex flex-wrap gap-3">
                {(() => {
                  const status = normalizeStatus(selectedReport.status);
                  const canApprove = status === 'draft' || status === 'denied';
                  const canDeny = status === 'draft' || status === 'approved';

                  return (
                    <>
                      {canApprove && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleStatusChange(selectedReport, 'Approved')}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                            isActionLoading
                              ? 'cursor-not-allowed bg-green-600/40 text-green-200'
                              : 'bg-green-500 text-black hover:bg-green-400'
                          }`}
                        >
                          {isActionLoading ? 'Processando...' : 'Aprovar'}
                        </button>
                      )}

                      {canDeny && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleStatusChange(selectedReport, 'Denied')}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                            isActionLoading
                              ? 'cursor-not-allowed bg-red-600/40 text-red-200'
                              : 'bg-red-500 text-white hover:bg-red-400'
                          }`}
                        >
                          {isActionLoading ? 'Processando...' : 'Negar'}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {actionFeedback && (
              <div
                className={`mt-4 rounded-xl border p-3 text-sm ${
                  actionFeedback.type === 'success'
                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
              >
                {actionFeedback.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
