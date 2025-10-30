'use client';

import { useMemo } from 'react';
import AreaGraficoLinha from './areagrafico';
import { MOCK_CRIME_DATA, CrimeData } from '../../dashboards/data/mockData';

interface ChartData {
  name: string; 
  [key: string]: string | number;
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

const CRIME_TYPE_MAPPING: { [key: string]: string } = {
  'homicidios': 'Homicídios e Tentativas',
  'trafico': 'Tráfico de Drogas',
  'crimes_sem_violencia': 'Crimes sem Violência',
  'violencia_domestica': 'Violência Doméstica',
  'crimes_patrimonio': 'Crimes Contra o Patrimônio',
};

interface GraficoDeLinhaProps {
  data?: CrimeData[];
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const crimeTypes = Object.values(CRIME_TYPE_MAPPING);

export default function GraficoDeLinha({ data }: GraficoDeLinhaProps) {
  // Usar dados fornecidos ou dados fictícios
  const crimeData = data || MOCK_CRIME_DATA;

  // Agrupar dados por mês e tipo de crime
  const chartData = useMemo(() => {
    const baseData: { [key: number]: any } = {};
    
    monthNames.forEach((monthName, index) => {
      baseData[index] = { name: monthName };
      crimeTypes.forEach(type => {
        baseData[index][type] = 0;
      });
    });

    crimeData.forEach((crime) => {
      const date = new Date(crime.crimeDate);
      const monthIndex = date.getMonth(); // 0-11
      
      const crimeTypeName = CRIME_TYPE_MAPPING[crime.crimeType.toLowerCase()];
      
      if (crimeTypeName) {
        baseData[monthIndex][crimeTypeName]++;
      }
    });

    return Object.values(baseData) as ChartData[];
  }, [crimeData]);

  return (
    <section className="w-full h-full">
      <AreaGraficoLinha data={chartData} colors={COLORS} crimeTypes={crimeTypes} />
    </section>
  );
}