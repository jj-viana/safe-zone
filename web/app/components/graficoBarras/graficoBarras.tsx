'use client';

import { useMemo } from 'react';
import AreaGrafico from './areaGrafico';
import { CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const ETHNICITY_MAPPING: Record<string, string> = {
  branco: 'Branco',
  negro: 'Negro',
  pardo: 'Pardo',
  asiatico: 'Asiático',
  indigena: 'Indígena',
  outro: 'Outro',
};

interface GraficodeBarrasProps {
  data: CrimeData[]; // agora obrigatorio
}

export default function GraficodeBarras({ data }: GraficodeBarrasProps) {
  // usa apenas os dados filtrados vindos do Dashboard
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    data.forEach((crime) => {
      const ethnicityKey = crime.reporterDetails.ethnicity.toLowerCase();
      const displayName =
        ETHNICITY_MAPPING[ethnicityKey] || crime.reporterDetails.ethnicity;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  }, [data]);

  return (
    <section className="w-full h-full">
      <AreaGrafico data={chartData} colors={COLORS} />
    </section>
  );
}
