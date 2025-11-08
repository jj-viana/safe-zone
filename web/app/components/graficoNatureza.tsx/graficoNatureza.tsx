'use client';

import { useMemo } from 'react';
import AreaGraficoNatureza from './AreaGraficoNatureza';
import { CrimeData } from '../../dashboards/data/mockData';

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
};

interface GraficoNaturezaProps {
  data: CrimeData[]; // obrigatorio
}

export default function GraficoNatureza({ data }: GraficoNaturezaProps) {
  // usa apenas os dados filtrados recebidos do Dashboard
  const chartData = useMemo<ChartData[]>(() => {
    const grouped: Record<string, number> = {};

    data.forEach(crime => {
      const crimeTypeKey = crime.crimeType.toLowerCase();
      const displayName = CRIME_TYPE_MAPPING[crimeTypeKey] || crime.crimeType;
      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <section className="w-full h-full">
      <AreaGraficoNatureza data={chartData} colors={COLORS} />
    </section>
  );
}
