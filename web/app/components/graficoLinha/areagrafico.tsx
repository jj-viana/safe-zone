'use client';
import dynamic from 'next/dynamic';

const GraficoDeLinha = dynamic(
  () => import('@/app/components/graficoLinha/graficolinha'),
  { 
    ssr: false, 
    loading: () => <div className="w-full h-[300px] bg-gray-800 animate-pulse rounded-lg" /> 
  }
);

export default function AreaGraficos() {
  return (
    <div className="mt-0 p-0 bg-black-900"> 
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        Relatórios de Crimes por Mês (Exemplo)
      </h2>
      <div className="w-full h-[450px]">
        <GraficoDeLinha />
      </div>
    </div>
  );
}