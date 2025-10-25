// app/components/graficoLinha/graficolinha.tsx

'use client';

import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface CrimeData {
    id: string;
    crimeGenre: string;
    crimeType: string;
    description: string;
    location: string;
    crimeDate: string;
    reporterDetails: {
        ageGroup: string;
        ethnicity: string;
        genderIdentity: string;
        sexualOrientation: string;
    };
    createdDate: string;
    resolved: boolean;
    partitionKey: string;
    _rid: string;
    _self: string;
    _etag: string;
    _attachments: string;
    _ts: number;
}

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

const mockData: CrimeData[] = [
  // Jan
  {
    id: '1', crimeGenre: 'crime', crimeType: 'homicidios', description: 'Homicídio doloso', location: 'Centro', crimeDate: '2025-01-10T22:00:21.354Z',
    reporterDetails: { ageGroup: '25-34', ethnicity: 'pardo', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-01-10T22:00:24.952316Z', resolved: false, partitionKey: '1', _rid: 'rid1', _self: 'self1', _etag: 'etag1', _attachments: 'attachments/', _ts: 1761084025
  },
  // Fev
  {
    id: '2', crimeGenre: 'crime', crimeType: 'violencia_domestica', description: 'Agressão doméstica', location: 'Residencial', crimeDate: '2025-02-15T18:00:00.000Z',
    reporterDetails: { ageGroup: '35-44', ethnicity: 'branco', genderIdentity: 'feminino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-02-15T18:00:24.952316Z', resolved: true, partitionKey: '2', _rid: 'rid2', _self: 'self2', _etag: 'etag2', _attachments: 'attachments/', _ts: 1761084026
  },
  // Mar
  {
    id: '3', crimeGenre: 'crime', crimeType: 'crimes_sem_violencia', description: 'Roubo de bicicleta', location: 'Bairro A', crimeDate: '2025-03-05T10:00:00.000Z',
    reporterDetails: { ageGroup: '18-24', ethnicity: 'negro', genderIdentity: 'masculino', sexualOrientation: 'nao_informado' },
    createdDate: '2025-03-05T10:00:24.952316Z', resolved: false, partitionKey: '3', _rid: 'rid3', _self: 'self3', _etag: 'etag3', _attachments: 'attachments/', _ts: 1761084027
  },
  {
    id: '4', crimeGenre: 'crime', crimeType: 'crimes_sem_violencia', description: 'Vandalismo', location: 'Parque', crimeDate: '2025-03-20T15:00:00.000Z',
    reporterDetails: { ageGroup: '18-24', ethnicity: 'pardo', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-03-20T15:00:24.952316Z', resolved: false, partitionKey: '4', _rid: 'rid4', _self: 'self4', _etag: 'etag4', _attachments: 'attachments/', _ts: 1761084028
  },
  // Abr
  {
    id: '5', crimeGenre: 'crime', crimeType: 'crimes_patrimonio', description: 'Roubo de carro', location: 'Estacionamento', crimeDate: '2025-04-12T08:00:00.000Z',
    reporterDetails: { ageGroup: '45-54', ethnicity: 'branco', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-04-12T08:00:24.952316Z', resolved: false, partitionKey: '5', _rid: 'rid5', _self: 'self5', _etag: 'etag5', _attachments: 'attachments/', _ts: 1761084029
  },
  // Jun
  {
    id: '6', crimeGenre: 'crime', crimeType: 'trafico', description: 'Tráfico de drogas', location: 'Periferia', crimeDate: '2025-06-22T13:00:00.000Z',
    reporterDetails: { ageGroup: '18-24', ethnicity: 'negro', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-06-22T13:00:24.952316Z', resolved: true, partitionKey: '6', _rid: 'rid6', _self: 'self6', _etag: 'etag6', _attachments: 'attachments/', _ts: 1761084030
  },
  // Jul
  {
    id: '7', crimeGenre: 'crime', crimeType: 'homicidios', description: 'Tentativa de Homicídio', location: 'Rua Principal', crimeDate: '2025-07-30T23:00:00.000Z',
    reporterDetails: { ageGroup: '25-34', ethnicity: 'negro', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-07-30T23:00:24.952316Z', resolved: false, partitionKey: '7', _rid: 'rid7', _self: 'self7', _etag: 'etag7', _attachments: 'attachments/', _ts: 1761084031
  },
  // Ago
  {
    id: '8', crimeGenre: 'crime', crimeType: 'trafico', description: 'Venda de entorpecentes', location: 'Praça', crimeDate: '2025-08-14T01:00:00.000Z',
    reporterDetails: { ageGroup: '18-24', ethnicity: 'pardo', genderIdentity: 'feminino', sexualOrientation: 'nao_informado' },
    createdDate: '2025-08-14T01:00:24.952316Z', resolved: false, partitionKey: '8', _rid: 'rid8', _self: 'self8', _etag: 'etag8', _attachments: 'attachments/', _ts: 1761084032
  },
  // Set
  {
    id: '9', crimeGenre: 'crime', crimeType: 'crimes_patrimonio', description: 'Assalto a loja', location: 'Centro', crimeDate: '2025-09-02T16:00:00.000Z',
    reporterDetails: { ageGroup: '25-34', ethnicity: 'branco', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-09-02T16:00:24.952316Z', resolved: false, partitionKey: '9', _rid: 'rid9', _self: 'self9', _etag: 'etag9', _attachments: 'attachments/', _ts: 1761084033
  },
  // Out
  {
    id: '10', crimeGenre: 'crime', crimeType: 'violencia_domestica', description: 'Ameaça', location: 'Residencial', crimeDate: '2025-10-10T19:00:00.000Z',
    reporterDetails: { ageGroup: '25-34', ethnicity: 'pardo', genderIdentity: 'feminino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-10-10T19:00:24.952316Z', resolved: false, partitionKey: '10', _rid: 'rid10', _self: 'self10', _etag: 'etag10', _attachments: 'attachments/', _ts: 1761084034
  },
  // Nov
  {
    id: '11', crimeGenre: 'crime', crimeType: 'homicidios', description: 'Homicídio doloso', location: 'Zona Oeste', crimeDate: '2025-11-28T02:00:00.000Z',
    reporterDetails: { ageGroup: '35-44', ethnicity: 'negro', genderIdentity: 'masculino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-11-28T02:00:24.952316Z', resolved: false, partitionKey: '11', _rid: 'rid11', _self: 'self11', _etag: 'etag11', _attachments: 'attachments/', _ts: 1761084035
  },
  // Dez
  {
    id: '12', crimeGenre: 'crime', crimeType: 'crimes_sem_violencia', description: 'Furto de celular', location: 'Shopping', crimeDate: '2025-12-20T17:00:00.000Z',
    reporterDetails: { ageGroup: '18-24', ethnicity: 'branco', genderIdentity: 'feminino', sexualOrientation: 'heterossexual' },
    createdDate: '2025-12-20T17:00:24.952316Z', resolved: true, partitionKey: '12', _rid: 'rid12', _self: 'self12', _etag: 'etag12', _attachments: 'attachments/', _ts: 1761084036
  }
];

interface GraficoDeLinhaProps {
  data?: CrimeData[];
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const crimeTypes = Object.values(CRIME_TYPE_MAPPING);


export default function GraficoDeLinha({ data }: GraficoDeLinhaProps) {
  const crimeData = data || mockData;

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

  return(
      <ResponsiveContainer width="100%" height="100%">
          <LineChart  
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#222', border: 'none' }} 
                  itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }}/>
              {crimeTypes.map((crimeName, index) => (
                <Line 
                  key={crimeName}
                  type="monotone"
                  dataKey={crimeName}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              ))}
              
          </LineChart>
      </ResponsiveContainer>
  );
}