'use client';

import { useMemo } from 'react';
import AreaPizza, { type ChartData } from './areaPizza';
import { CrimeData } from '../../dashboards/data/mockData';

interface GraficoPizzaProps {
  data: CrimeData[]; // Recebe os dados filtrados
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

// Componente
export default function GraficoPizza({ data }: GraficoPizzaProps) {
  const chartData = useMemo<ChartData[]>(() => {
    const sourceData = data ?? [];

    const grouped = sourceData.reduce((acc, crime) => {
      const ageGroup = crime.reporterDetails.ageGroup;
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  return (
    <section className="w-full h-full">
      <AreaPizza data={chartData} colors={COLORS} />
    </section>
  );
}
