'use client';

import { useMemo } from 'react';
import CrimeNatureBarChartSurface from './crime-nature-bar-chart-surface';
import type { ReportResponse } from '@/lib/api';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const CRIME_TYPE_MAPPING: Record<string, string> = {
  homicidios: 'Homicídios e Tentativas',
  trafico: 'Tráfico de Drogas',
  crimes_sem_violencia: 'Crimes sem Violência',
  violencia_domestica: 'Violência Doméstica',
  crimes_patrimonio: 'Crimes Contra o Patrimônio',
  nao_informado: 'Não informado',
};

const UNKNOWN_LABEL = 'Não informado';

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '_');

interface CrimeNatureBarChartProps {
  data: ReportResponse[];
}

export default function CrimeNatureBarChart({ data }: CrimeNatureBarChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    const grouped: Record<string, number> = {};

    data.forEach(report => {
      const rawType = report.crimeType?.trim();
      const key = rawType ? normalizeKey(rawType) : 'nao_informado';
      const displayName = CRIME_TYPE_MAPPING[key] || rawType || UNKNOWN_LABEL;
      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const containerHeight = Math.max(500, chartData.length * 60);

  return (
    <section className="w-full" style={{ height: containerHeight }}>
      <CrimeNatureBarChartSurface data={chartData} colors={COLORS} />
    </section>
  );
}
