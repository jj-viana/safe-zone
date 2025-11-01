'use client';

import { useMemo } from 'react';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';

interface DistributionData {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

const SEXUAL_ORIENTATION_MAPPING: { [key: string]: string } = {
  'heterossexual': 'Heterossexual',
  'homossexual': 'Homossexual',
  'bissexual': 'Bissexual',
  'asexual': 'Assexual',
  'outro': 'Outro',
  'prefiro_nao_informar': 'Prefiro Não Informar',
};

interface GraficoDistribuicaoProps {
  data?: CrimeData[];
}

export default function GraficoDistribuicao({ data }: GraficoDistribuicaoProps) {
  // Usar dados fornecidos ou dados fictícios
  const crimeData = data || MOCK_CRIME_DATA;

  // Agrupar e contar ocorrências por sexualOrientation
  const distributionData = useMemo(() => {
    const grouped: { [key: string]: number } = {};

    crimeData.forEach((crime) => {
      const orientationKey = crime.reporterDetails.sexualOrientation.toLowerCase();
      const displayName = SEXUAL_ORIENTATION_MAPPING[orientationKey] || crime.reporterDetails.sexualOrientation;

      grouped[displayName] = (grouped[displayName] || 0) + 1;
    });

    const total = crimeData.length;

    return Object.entries(grouped)
      .map(([label, count], index) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count) as DistributionData[];
  }, [crimeData]);

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