'use client';

import { useMemo } from 'react';
import AreaPizza from './areaPizza';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';
interface ChartData {
  name: string;
  value: number;
}

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

interface GraficoPizzaProps {
  data?: CrimeData[];
}

export default function GraficoPizza({ data }: GraficoPizzaProps) {
  const crimeData = data || MOCK_CRIME_DATA;

  const chartData = useMemo(() => {
    const grouped = crimeData.reduce(
      (acc, crime) => {
        const ageGroup = crime.reporterDetails.ageGroup;
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        
        return acc;
      },
      {} as { [key: string]: number }
    );

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  }, [crimeData]);

  return (
    <section className="w-full max-w-[1920px] px-[128px] py-0">
      <AreaPizza data={chartData} colors={COLORS} />
    </section>
  );
}