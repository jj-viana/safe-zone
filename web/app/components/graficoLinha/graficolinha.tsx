'use client';

import { useMemo } from 'react';
import AreaGraficoLinha from './areagrafico';
import { CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string; 
  [key: string]: string | number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const CRIME_TYPE_MAPPING: Record<string, string> = {
  homicidios: 'Homicídios e Tentativas',
  trafico: 'Tráfico de Drogas',
  crimes_sem_violencia: 'Crimes sem Violência',
  violencia_domestica: 'Violência Doméstica',
  crimes_patrimonio: 'Crimes Contra o Patrimônio',
};

interface GraficoDeLinhaProps {
  data: CrimeData[]; // agora obrigatorio
}

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const crimeTypes = Object.values(CRIME_TYPE_MAPPING);

export default function GraficoDeLinha({ data }: GraficoDeLinhaProps) {
  // ✅ agora usa apenas os dados filtrados recebidos do Dashboard
  const chartData = useMemo(() => {
    const baseData: Record<number, Record<string, number | string>> = {};

    // Inicializa meses e tipos de crime
    monthNames.forEach((monthName, index) => {
      baseData[index] = { name: monthName };
      crimeTypes.forEach(type => {
        baseData[index][type] = 0;
      });
    });

    // Conta crimes por mês e tipo
    data.forEach(crime => {
      const date = new Date(crime.crimeDate);
      const monthIndex = date.getMonth();
      const crimeTypeName = CRIME_TYPE_MAPPING[crime.crimeType.toLowerCase()];

      if (crimeTypeName) {
        (baseData[monthIndex][crimeTypeName] as number)++;
      }
    });

    return Object.values(baseData) as ChartData[];
  }, [data]);

  return (
    <section className="w-full h-full">
      <AreaGraficoLinha data={chartData} colors={COLORS} crimeTypes={crimeTypes} />
    </section>
  );
}
