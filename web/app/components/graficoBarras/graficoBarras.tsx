'use client';

import { useMemo } from 'react';
import AreaGrafico from './areaGrafico';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const ETHNICITY_MAPPING: { [key: string]: string } = {
  'branco': 'Branco',
  'negro': 'Negro',
  'pardo': 'Pardo',
  'asiatico': 'Asiático',
  'indigena': 'Indígena',
  'outro': 'Outro',
};

interface GraficodeBarrasProps {
  data?: CrimeData[];
}

export default function GraficodeBarras({ data }: GraficodeBarrasProps) {
  const crimeData = data || MOCK_CRIME_DATA;

  // Agrupar e contar ocorrências por ethnicity
  const chartData = useMemo(() => {
    const grouped: { [key: string]: number } = {};

    crimeData.forEach((crime) => {
      const ethnicityKey = crime.reporterDetails.ethnicity.toLowerCase();
      const displayName = ETHNICITY_MAPPING[ethnicityKey] || crime.reporterDetails.ethnicity;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  }, [crimeData]);

  return (
    <section className="w-full h-full">
      <AreaGrafico data={chartData} colors={COLORS} />
    </section>
  );
}