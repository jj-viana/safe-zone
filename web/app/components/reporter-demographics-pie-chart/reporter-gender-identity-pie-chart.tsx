'use client';

import { useMemo } from 'react';
import PieChartSurface, { type ChartData } from './pie-chart-surface';
import type { ReportResponse } from '@/lib/api';

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const GENDER_MAPPING: Record<string, string> = {
  'homem cisgenero': 'Homem Cisgênero',
  'mulher cisgenero': 'Mulher Cisgênero',
  'homem transgenero': 'Homem Transgênero',
  'mulher transgenero': 'Mulher Transgênero',
  'pessoa nao binaria': 'Pessoa Não Binária',
  'prefiro nao informar': 'Prefiro não informar',
};

const UNKNOWN_LABEL = 'Não informado';

interface ReporterGenderIdentityPieChartProps {
  data: ReportResponse[];
}

export default function ReporterGenderIdentityPieChart({ data }: ReporterGenderIdentityPieChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    const grouped: Record<string, number> = {};

    data.forEach(report => {
      const gender = report.reporterDetails?.genderIdentity?.trim();
      const normalized = gender
        ? gender
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
        : undefined;
      const displayName = normalized
        ? GENDER_MAPPING[normalized] || gender || UNKNOWN_LABEL
        : UNKNOWN_LABEL;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <section className="w-full h-full">
      <PieChartSurface data={chartData} colors={COLORS} />
    </section>
  );
}
