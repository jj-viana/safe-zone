'use client';

import { useMemo } from 'react';
import LineChartSurface from './line-chart-surface';
import type { ReportResponse } from '@/lib/api';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const MONTH_ABBREVIATIONS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const UNKNOWN_LABEL = 'Não informado';

interface CrimeTypeLineChartProps {
  data: ReportResponse[];
}

export default function CrimeTypeLineChart({ data }: CrimeTypeLineChartProps) {
  const crimeTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        data
          .map(report => report.crimeType?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
    return uniqueTypes.length ? uniqueTypes : [UNKNOWN_LABEL];
  }, [data]);

  const chartData = useMemo(() => {
    const baseData: Record<number, Record<string, number | string>> = {};
    MONTH_ABBREVIATIONS.forEach((monthName, index) => {
      baseData[index] = { name: monthName };
      crimeTypes.forEach(type => {
        baseData[index][type] = 0;
      });
    });

    data.forEach(report => {
      const date = new Date(report.crimeDate);
      if (Number.isNaN(date.getTime())) return;
      const monthIndex = date.getMonth();
      const typeLabel = report.crimeType?.trim() || UNKNOWN_LABEL;
      if (!(typeLabel in baseData[monthIndex])) {
        baseData[monthIndex][typeLabel] = 0;
      }
      (baseData[monthIndex][typeLabel] as number)++;
    });

    return Object.values(baseData) as ChartData[];
  }, [data, crimeTypes]);

  return (
    <section className="w-full h-full">
      <LineChartSurface data={chartData} colors={COLORS} crimeTypes={crimeTypes} />
    </section>
  );
}
