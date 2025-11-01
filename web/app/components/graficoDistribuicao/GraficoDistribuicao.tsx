'use client';

import { useMemo } from 'react';
import { CrimeData } from '../../dashboards/data/mockData';

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
  prefiro_nao_informar: 'Prefiro Não Informar',
};

interface GraficoDistribuicaoProps {
  data: CrimeData[]; // ✅ agora obrigatório
}

export default function GraficoDistribuicao({ data }: GraficoDistribuicaoProps) {
  // ✅ usa apenas os dados filtrados vindos do Dashboard
  const distributionData = useMemo(() => {
    const grouped: Record<string, number> = {};

    data.forEach(crime => {
      const orientationKey = crime.reporterDetails.sexualOrientation.toLowerCase();
      const displayName =
        SEXUAL_ORIENTATION_MAPPING[orientationKey] ||
        crime.reporterDetails.sexualOrientation;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    const total = data.length || 1;

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
