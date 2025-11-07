'use client';

import { useMemo } from 'react';
import AreaPizza from './areaPizza';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

// mudei as chaves p seguir o form/mockData
const GENDER_MAPPING: { [key: string]: string } = {
  'Homem Cisgênero': 'Homem Cisgênero',
  'Mulher Cisgênero': 'Mulher Cisgênero',
  'Homem Transgênero': 'Homem Transgênero',
  'Mulher Transgênero': 'Mulher Transgênero',
  'Pessoa não binária': 'Pessoa Não Binária',
  'Prefiro não informar': 'Prefiro não informar',
};

interface GraficoPizzaGeneroProps {
  data?: CrimeData[];
}

export default function GraficoPizzaGenero({ data }: GraficoPizzaGeneroProps) {
  const crimeData = data || MOCK_CRIME_DATA;

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    crimeData.forEach((crime) => {
      const genderKey = crime.reporterDetails.genderIdentity.trim();
      const displayName = GENDER_MAPPING[genderKey] || crime.reporterDetails.genderIdentity;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) as ChartData[];
  }, [crimeData]);

  return (
    <section className="w-full h-full">
      <AreaPizza data={chartData} colors={COLORS} />
    </section>
  );
}