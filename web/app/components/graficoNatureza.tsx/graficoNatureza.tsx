'use client';

import { useMemo } from 'react';
import AreaGraficoNatureza from './AreaGraficoNatureza';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const CRIME_TYPE_MAPPING: { [key: string]: string } = {
  'homicidios': 'Homicídios e Tentativas',
  'trafico': 'Tráfico de Drogas',
  'crimes_sem_violencia': 'Crimes sem Violência',
  'violencia_domestica': 'Violência Doméstica',
  'crimes_patrimonio': 'Crimes Contra o Patrimônio',
};

interface GraficoNaturezaProps {
  data?: CrimeData[];
}

export default function GraficoNatureza({ data }: GraficoNaturezaProps) {
  // Usar dados fornecidos ou dados fictícios
  const crimeData = data || MOCK_CRIME_DATA;

  // Agrupar e contar ocorrências por crimeType
  const chartData = useMemo(() => {
    const grouped: { [key: string]: number } = {};

    crimeData.forEach((crime) => {
      const crimeTypeKey = crime.crimeType.toLowerCase();
      const displayName = CRIME_TYPE_MAPPING[crimeTypeKey] || crime.crimeType;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value) as ChartData[];
  }, [crimeData]);

  return (
    <section className="w-full h-full">
      <AreaGraficoNatureza data={chartData} colors={COLORS} />
    </section>
  );
}
