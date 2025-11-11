'use client';

import { useMemo } from 'react';
import BarChartSurface from './bar-chart-surface';
import type { ReportResponse } from '@/lib/api';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const ETHNICITY_MAPPING: Record<string, string> = {
  branca: 'Branca',
  negra: 'Negra',
  parda: 'Parda',
  amarela: 'Amarela',
  indígena: 'Indígena',
  indigena: 'Indígena',
  'prefiro não informar': 'Prefiro não informar',
  'prefiro nao informar': 'Prefiro não informar',
  'não informado': 'Não informado',
  'nao informado': 'Não informado',
};

const UNKNOWN_LABEL = 'Não informado';

interface ReporterEthnicityBarChartProps {
  data: ReportResponse[];
}

export default function ReporterEthnicityBarChart({ data }: ReporterEthnicityBarChartProps) {
  // Uses the filtered dataset provided by the dashboard
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    data.forEach(report => {
      const ethnicity = report.reporterDetails?.ethnicity?.trim();
      const key = ethnicity?.toLowerCase() ?? UNKNOWN_LABEL.toLowerCase();
      const displayName = ETHNICITY_MAPPING[key] || ethnicity || UNKNOWN_LABEL;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  }, [data]);

  return (
    <section className="w-full h-full">
      <BarChartSurface data={chartData} colors={COLORS} />
    </section>
  );
}
