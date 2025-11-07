'use client';

import { useMemo } from 'react';
import AreaGraficoLinha from './areagrafico';
import { CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string; 
  [key: string]: string | number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

interface GraficoDeLinhaProps {
  data: CrimeData[];
}

export default function GraficoDeLinha({ data }: GraficoDeLinhaProps) {
  console.log('filteredData', data.map(d => ({
    id: d.id,
    crimeType: d.crimeType,
    crimeDate: d.crimeDate
  })));

  const crimeTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(data.map(d => d.crimeType)));
    return uniqueTypes.length ? uniqueTypes : ['Sem dados'];
  }, [data]);

  const chartData = useMemo(() => {
    const baseData: Record<number, Record<string, number | string>> = {};
    monthNames.forEach((monthName, index) => {
      baseData[index] = { name: monthName };
      crimeTypes.forEach(type => {
        baseData[index][type] = 0;
      });
    });

    data.forEach(crime => {
      const date = new Date(crime.crimeDate);
      if (Number.isNaN(date.getTime())) return;
      const monthIndex = date.getMonth();
      const typeLabel = crime.crimeType || 'Não informado';
      if (!(typeLabel in baseData[monthIndex])) {
        baseData[monthIndex][typeLabel] = 0;
      }
      (baseData[monthIndex][typeLabel] as number)++;
    });

    const result = Object.values(baseData) as ChartData[];
    console.log('chartData', result);
    return result;
  }, [data, crimeTypes]);

  return (
    <section className="w-full h-full">
      <AreaGraficoLinha data={chartData} colors={COLORS} crimeTypes={crimeTypes} />
    </section>
  );
}
