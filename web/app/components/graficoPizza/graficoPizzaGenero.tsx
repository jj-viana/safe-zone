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

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const GENDER_MAPPING: { [key: string]: string } = {
  'masculino': 'Masculino',
  'feminino': 'Feminino',
  'nao_binario': 'Não Binário',
  'outro': 'Outro',
};

interface GraficoPizzaProps {
  data?: CrimeData[];
}

export default function GraficoPizza({ data }: GraficoPizzaProps) {
  const crimeData = data || MOCK_CRIME_DATA;

  const chartData = useMemo(() => {
    const grouped: { [key: string]: number } = {};

    crimeData.forEach((crime) => {
      const genderKey = crime.reporterDetails.genderIdentity.toLowerCase();
      const displayName = GENDER_MAPPING[genderKey] || crime.reporterDetails.genderIdentity;

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
      <AreaPizza data={chartData} colors={COLORS} />
    </section>
  );
}