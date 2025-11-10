'use client';

import { useMemo } from 'react';
import PieChartSurface, { type ChartData } from './pie-chart-surface';
import type { ReportResponse } from '@/lib/api';

interface ReporterAgeGroupPieChartProps {
  data: ReportResponse[];
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const UNKNOWN_LABEL = 'Não informado';

export default function ReporterAgeGroupPieChart({ data }: ReporterAgeGroupPieChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    const sourceData = data ?? [];

    const grouped = sourceData.reduce((acc, report) => {
      const ageGroup = report.reporterDetails?.ageGroup?.trim() || UNKNOWN_LABEL;
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
      <PieChartSurface data={chartData} colors={COLORS} />
    </section>
  );
}
