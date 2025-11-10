'use client';

import { useMemo } from 'react';
import type { ReportResponse } from '@/lib/api';

interface DistributionData {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const SEXUAL_ORIENTATION_MAPPING: Record<string, string> = {
  heterossexual: 'Heterossexual',
  homossexual: 'Homossexual',
  bissexual: 'Bissexual',
  assexual: 'Assexual',
  outro: 'Outro',
  'prefiro não informar': 'Prefiro não informar',
  prefiro_nao_informar: 'Prefiro não informar',
  'não informado': 'Não informado',
  'nao informado': 'Não informado',
  nao_informado: 'Não informado',
};

const UNKNOWN_LABEL = 'Não informado';

interface ReporterSexualOrientationDistributionProps {
  data: ReportResponse[];
}

export default function ReporterSexualOrientationDistribution({ data }: ReporterSexualOrientationDistributionProps) {
  // Uses the filtered dataset provided by the dashboard
  const distributionData = useMemo<DistributionData[]>(() => {
    const grouped: Record<string, number> = {};

    data.forEach(report => {
      const orientation = report.reporterDetails?.sexualOrientation?.trim();
      const key = orientation?.toLowerCase() ?? UNKNOWN_LABEL.toLowerCase();
      const displayName =
        SEXUAL_ORIENTATION_MAPPING[key] ||
        orientation ||
        UNKNOWN_LABEL;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    const total = Object.values(grouped).reduce((sum, count) => sum + count, 0) || 1;

    return Object.entries(grouped)
      .map(([label, count], index) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto">
      {distributionData.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">{item.label}</span>
          <span className="text-sm font-extrabold" style={{ color: item.color }}>
            {item.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}
