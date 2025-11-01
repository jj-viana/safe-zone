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
  // --- DADOS ANTIGOS (DATAS ATUALIZADAS) ---
  {
    id: '1',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Centro',
    crimeDate: '2025-01-15T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-01-15T22:00:24.952316Z',
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
    crimeDate: '2025-02-10T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-02-10T22:00:24.952316Z',
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
    crimeDate: '2025-03-05T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-03-05T22:00:24.952316Z',
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
    crimeDate: '2025-04-12T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'pardo',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-04-12T22:00:24.952316Z',
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
    crimeDate: '2025-05-20T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '45-54',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-05-20T22:00:24.952316Z',
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
    crimeDate: '2025-06-01T22:00:21.354Z', // <-- Data alterada
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-06-01T22:00:24.952316Z',
    resolved: false,
    partitionKey: '6',
    _rid: 'v2InAL8nuYkZAAAAAAAAAA==',
    _self: 'dbs/v2InAA==/colls/v2InAL8nuYk=/docs/v2InAL8nuYkZAAAAAAAAAA==/',
    _etag: '"34087f34-0000-0200-0000-68f802790000"',
    _attachments: 'attachments/',
    _ts: 1761084025,
  },

  // --- NOVOS DADOS (24 ENTRADAS) ---

  // --- Categoria: Asexual / Nao_Binario / Asiatico
  {
    id: '7',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Vandalismo',
    location: 'Parque',
    crimeDate: '2025-01-20T10:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'asiatico',
      genderIdentity: 'nao_binario',
      sexualOrientation: 'asexual',
    },
    createdDate: '2025-01-20T10:00:24.952316Z',
    resolved: false,
    partitionKey: '7',
    _rid: 'rid_7', _self: 'self_7', _etag: 'etag_7', _attachments: 'attachments/', _ts: 1761084026
  },
  // --- Categoria: Outro (Orientação) / Outro (Gênero)
  {
    id: '8',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Ameaça',
    location: 'Residencial',
    crimeDate: '2025-02-18T14:00:00.000Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'pardo',
      genderIdentity: 'outro',
      sexualOrientation: 'outro',
    },
    createdDate: '2025-02-18T14:00:24.952316Z',
    resolved: true,
    partitionKey: '8',
    _rid: 'rid_8', _self: 'self_8', _etag: 'etag_8', _attachments: 'attachments/', _ts: 1761084027
  },
  // --- Categoria: Prefiro Nao Informar (Orientação) / Indigena
  {
    id: '9',
    crimeGenre: 'crime',
    crimeType: 'trafico',
    description: 'Porte de entorpecentes',
    location: 'Praça',
    crimeDate: '2025-03-10T11:00:00.000Z',
    reporterDetails: {
      ageGroup: '45-54',
      ethnicity: 'indigena',
      genderIdentity: 'masculino',
      sexualOrientation: 'prefiro_nao_informar',
    },
    createdDate: '2025-03-10T11:00:24.952316Z',
    resolved: false,
    partitionKey: '9',
    _rid: 'rid_9', _self: 'self_9', _etag: 'etag_9', _attachments: 'attachments/', _ts: 1761084028
  },
  // --- Categoria: 55-64 / Outro (Etnia)
  {
    id: '10',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Tentativa de Homicídio',
    location: 'Bar',
    crimeDate: '2025-04-05T23:00:00.000Z',
    reporterDetails: {
      ageGroup: '55-64',
      ethnicity: 'outro',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-04-05T23:00:24.952316Z',
    resolved: false,
    partitionKey: '10',
    _rid: 'rid_10', _self: 'self_10', _etag: 'etag_10', _attachments: 'attachments/', _ts: 1761084029
  },
  // --- Categoria: 65+
  {
    id: '11',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Furto de residência',
    location: 'Bairro Nobre',
    crimeDate: '2025-05-15T16:00:00.000Z',
    reporterDetails: {
      ageGroup: '65+',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-05-15T16:00:24.952316Z',
    resolved: true,
    partitionKey: '11',
    _rid: 'rid_11', _self: 'self_11', _etag: 'etag_11', _attachments: 'attachments/', _ts: 1761084030
  },
  // --- Aumentando volume (Jan)
  {
    id: '12',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Furto de celular',
    location: 'Ponto de ônibus',
    crimeDate: '2025-01-25T08:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-01-25T08:00:24.952316Z',
    resolved: false,
    partitionKey: '12',
    _rid: 'rid_12', _self: 'self_12', _etag: 'etag_12', _attachments: 'attachments/', _ts: 1761084031
  },
  // --- Aumentando volume (Fev)
  {
    id: '13',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Agressão',
    location: 'Residencial',
    crimeDate: '2025-02-20T19:00:00.000Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-02-20T19:00:24.952316Z',
    resolved: false,
    partitionKey: '13',
    _rid: 'rid_13', _self: 'self_13', _etag: 'etag_13', _attachments: 'attachments/', _ts: 1761084032
  },
  // --- Aumentando volume (Mar)
  {
    id: '14',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Assalto a mão armada',
    location: 'Posto de Gasolina',
    crimeDate: '2025-03-15T21:00:00.000Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-03-15T21:00:24.952316Z',
    resolved: false,
    partitionKey: '14',
    _rid: 'rid_14', _self: 'self_14', _etag: 'etag_14', _attachments: 'attachments/', _ts: 1761084033
  },
  // --- Aumentando volume (Abr)
  {
    id: '15',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Periferia',
    crimeDate: '2025-04-28T07:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-04-28T07:00:24.952316Z',
    resolved: true,
    partitionKey: '15',
    _rid: 'rid_15', _self: 'self_15', _etag: 'etag_15', _attachments: 'attachments/', _ts: 1761084034
  },
  // --- Aumentando volume (Jul)
  {
    id: '16',
    crimeGenre: 'crime',
    crimeType: 'trafico',
    description: 'Venda de entorpecentes',
    location: 'Escola',
    crimeDate: '2025-07-10T13:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-07-10T13:00:24.952316Z',
    resolved: false,
    partitionKey: '16',
    _rid: 'rid_16', _self: 'self_16', _etag: 'etag_16', _attachments: 'attachments/', _ts: 1761084035
  },
  {
    id: '17',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Furto de loja',
    location: 'Shopping',
    crimeDate: '2025-07-22T17:00:00.000Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'feminino',
      sexualOrientation: 'asexual',
    },
    createdDate: '2025-07-22T17:00:24.952316Z',
    resolved: false,
    partitionKey: '17',
    _rid: 'rid_17', _self: 'self_17', _etag: 'etag_17', _attachments: 'attachments/', _ts: 1761084036
  },
  // --- Aumentando volume (Ago)
  {
    id: '18',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Agressão',
    location: 'Residencial',
    crimeDate: '2025-08-05T20:00:00.000Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'pardo',
      genderIdentity: 'feminino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-08-05T20:00:24.952316Z',
    resolved: true,
    partitionKey: '18',
    _rid: 'rid_18', _self: 'self_18', _etag: 'etag_18', _attachments: 'attachments/', _ts: 1761084037
  },
  {
    id: '19',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Roubo de celular',
    location: 'Rua Principal',
    crimeDate: '2025-08-15T18:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'asiatico',
      genderIdentity: 'nao_binario',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-08-15T18:00:24.952316Z',
    resolved: false,
    partitionKey: '19',
    _rid: 'rid_19', _self: 'self_19', _etag: 'etag_19', _attachments: 'attachments/', _ts: 1761084038
  },
  // --- Aumentando volume (Set)
  {
    id: '20',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Zona Sul',
    crimeDate: '2025-09-02T03:00:00.000Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-09-02T03:00:24.952316Z',
    resolved: false,
    partitionKey: '20',
    _rid: 'rid_20', _self: 'self_20', _etag: 'etag_20', _attachments: 'attachments/', _ts: 1761084039
  },
  {
    id: '21',
    crimeGenre: 'crime',
    crimeType: 'trafico',
    description: 'Tráfico de drogas',
    location: 'Periferia',
    crimeDate: '2025-09-14T15:00:00.000Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-09-14T15:00:24.952316Z',
    resolved: true,
    partitionKey: '21',
    _rid: 'rid_21', _self: 'self_21', _etag: 'etag_21', _attachments: 'attachments/', _ts: 1761084040
  },
  {
    id: '22',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Ameaça',
    location: 'Residencial',
    crimeDate: '2025-09-25T16:00:00.000Z',
    reporterDetails: {
      ageGroup: '45-54',
      ethnicity: 'indigena',
      genderIdentity: 'feminino',
      sexualOrientation: 'outro',
    },
    createdDate: '2025-09-25T16:00:24.952316Z',
    resolved: false,
    partitionKey: '22',
    _rid: 'rid_22', _self: 'self_22', _etag: 'etag_22', _attachments: 'attachments/', _ts: 1761084041
  },
  // --- Aumentando volume (Out)
  {
    id: '23',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Furto de veículo',
    location: 'Estacionamento',
    crimeDate: '2025-10-10T12:00:00.000Z',
    reporterDetails: {
      ageGroup: '55-64',
      ethnicity: 'branco',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-10-10T12:00:24.952316Z',
    resolved: false,
    partitionKey: '23',
    _rid: 'rid_23', _self: 'self_23', _etag: 'etag_23', _attachments: 'attachments/', _ts: 1761084042
  },
  {
    id: '24',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Vandalismo',
    location: 'Estação de Metrô',
    crimeDate: '2025-10-18T18:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'pardo',
      genderIdentity: 'nao_binario',
      sexualOrientation: 'asexual',
    },
    createdDate: '2025-10-18T18:00:24.952316Z',
    resolved: true,
    partitionKey: '24',
    _rid: 'rid_24', _self: 'self_24', _etag: 'etag_24', _attachments: 'attachments/', _ts: 1761084043
  },
  // --- Aumentando volume (Nov)
  {
    id: '25',
    crimeGenre: 'crime',
    crimeType: 'homicidios',
    description: 'Homicídio doloso',
    location: 'Centro',
    crimeDate: '2025-11-05T01:00:00.000Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'negro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-11-05T01:00:24.952316Z',
    resolved: false,
    partitionKey: '25',
    _rid: 'rid_25', _self: 'self_25', _etag: 'etag_25', _attachments: 'attachments/', _ts: 1761084044
  },
  {
    id: '26',
    crimeGenre: 'crime',
    crimeType: 'violencia_domestica',
    description: 'Agressão',
    location: 'Residencial',
    crimeDate: '2025-11-15T19:00:00.000Z',
    reporterDetails: {
      ageGroup: '35-44',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'prefiro_nao_informar',
    },
    createdDate: '2025-11-15T19:00:24.952316Z',
    resolved: false,
    partitionKey: '26',
    _rid: 'rid_26', _self: 'self_26', _etag: 'etag_26', _attachments: 'attachments/', _ts: 1761084045
  },
  {
    id: '27',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Assalto a ônibus',
    location: 'Avenida Principal',
    crimeDate: '2025-11-25T20:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'pardo',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-11-25T20:00:24.952316Z',
    resolved: false,
    partitionKey: '27',
    _rid: 'rid_27', _self: 'self_27', _etag: 'etag_27', _attachments: 'attachments/', _ts: 1761084046
  },
  // --- Aumentando volume (Dez)
  {
    id: '28',
    crimeGenre: 'crime',
    crimeType: 'trafico',
    description: 'Tráfico de drogas',
    location: 'Festa',
    crimeDate: '2025-12-10T23:00:00.000Z',
    reporterDetails: {
      ageGroup: '18-24',
      ethnicity: 'branco',
      genderIdentity: 'feminino',
      sexualOrientation: 'bissexual',
    },
    createdDate: '2025-12-10T23:00:24.952316Z',
    resolved: false,
    partitionKey: '28',
    _rid: 'rid_28', _self: 'self_28', _etag: 'etag_28', _attachments: 'attachments/', _ts: 1761084047
  },
  {
    id: '29',
    crimeGenre: 'crime',
    crimeType: 'crimes_sem_violencia',
    description: 'Furto de loja',
    location: 'Shopping',
    crimeDate: '2025-12-20T14:00:00.000Z',
    reporterDetails: {
      ageGroup: '25-34',
      ethnicity: 'asiatico',
      genderIdentity: 'outro',
      sexualOrientation: 'homossexual',
    },
    createdDate: '2025-12-20T14:00:24.952316Z',
    resolved: true,
    partitionKey: '29',
    _rid: 'rid_29', _self: 'self_29', _etag: 'etag_29', _attachments: 'attachments/', _ts: 1761084048
  },
  {
    id: '30',
    crimeGenre: 'crime',
    crimeType: 'crimes_patrimonio',
    description: 'Roubo de carro',
    location: 'Garagem',
    crimeDate: '2025-12-28T21:00:00.000Z',
    reporterDetails: {
      ageGroup: '65+',
      ethnicity: 'outro',
      genderIdentity: 'masculino',
      sexualOrientation: 'heterossexual',
    },
    createdDate: '2025-12-28T21:00:24.952316Z',
    resolved: false,
    partitionKey: '30',
    _rid: 'rid_30', _self: 'self_30', _etag: 'etag_30', _attachments: 'attachments/', _ts: 1761084049
  },
];