export interface CrimeData {
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

// Mock data centralizado
export const MOCK_CRIME_DATA: CrimeData[] = [
  {
    id: '1',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Centro',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '1',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
  {
    id: '2',
    crimeGenre: 'crime',
    crimeType: 'trafico',
    description: 'Tráfico de drogas',
    location: 'Periferia',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: true,
    partitionKey: '2',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
  {
    id: '3',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Roubo de bicicleta',
    location: 'Bairro A',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '3',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
  {
    id: '4',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Agressão doméstica',
    location: 'Residencial',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: true,
    partitionKey: '4',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
  {
    id: '5',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Roubo de carro',
    location: 'Estacionamento',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '45-54',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '5',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
  {
    id: '6',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Rua Principal',
    crimeDate: '2025-10-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-10-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '6',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },
];