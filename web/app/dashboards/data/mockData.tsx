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

// Dados simulados de crimes e sensações de insegurança
export const MOCK_CRIME_DATA: CrimeData[] = [
  // --- DADOS ANTIGOS (DATAS ATUALIZADAS) ---
  {
    id: '1',
    crimeGenre: 'crime',
    crimeType: 'Assalto',
    description: 'Roubo à mão armada',
    location: 'Centro',
    crimeDate: '2025-03-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-03-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '1',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '2',
    crimeGenre: 'crime',
    crimeType: 'Violência Física',
    description: 'Agressão em via pública',
    location: 'Taguatinga',
    crimeDate: '2025-02-18T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-02-18T22:00:24.952316Z',
    resolved: true,
    partitionKey: '2',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '3',
    crimeGenre: 'crime',
    crimeType: 'Furto',
    description: 'Furto de bicicleta',
    location: 'Águas Claras',
    crimeDate: '2025-01-12T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-01-12T22:00:24.952316Z',
    resolved: false,
    partitionKey: '3',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '4',
    crimeGenre: 'crime',
    crimeType: 'Vandalismo',
    description: 'Pichação e danos a patrimônio público',
    location: 'Guará',
    crimeDate: '2025-05-10T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-05-10T22:00:24.952316Z',
    resolved: true,
    partitionKey: '4',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '5',
    crimeGenre: 'crime',
    crimeType: 'Assédio',
    description: 'Assédio em transporte público',
    location: 'Plano Piloto',
    crimeDate: '2025-06-21T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '45-54',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-06-21T22:00:24.952316Z',
    resolved: false,
    partitionKey: '5',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '6',
    crimeGenre: 'crime',
    crimeType: 'Violência Verbal',
    description: 'Discussão com ameaças',
    location: 'Ceilândia',
    crimeDate: '2025-08-01T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-08-01T22:00:24.952316Z',
    resolved: false,
    partitionKey: '6',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '7',
    crimeGenre: 'sensacao_inseguranca',
    crimeType: 'Iluminação precária',
    description: 'Rua sem iluminação',
    location: 'Taguatinga',
    crimeDate: '2025-04-15T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-04-15T22:00:24.952316Z',
    resolved: false,
    partitionKey: '7',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
  {
    id: '8',
    crimeGenre: 'sensacao_inseguranca',
    crimeType: 'Abandono de local público',
    description: 'Praça sem manutenção e policiamento',
    location: 'Águas Claras',
    crimeDate: '2025-07-20T22:00:21.354Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-07-20T22:00:24.952316Z',
    resolved: false,
    partitionKey: '8',
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: 1761084025,
  },
];
