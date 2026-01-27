/**
 * Central Mock Data Store
 * Fonte única de verdade para dados falsos
 * Qualquer mudança aqui reflete em toda a aplicação
 */

// ============================================
// PROFESSORES (Teachers/Docentes)
// ============================================
export const mockProfessors = [
  {
    id: 1,
    name: 'Prof. Mock 1 Detalhado',
    email: 'mock1@unicamp.br',
    lattes: 'http://lattes...',
    themes: ['IA', 'Redes Neurais'],
    tags: ['IA', 'Redes Neurais'],
    availableSpots: 5,
    totalSpots: 5,
    vagas: 5,
  },
  {
    id: 2,
    name: 'Prof. Mock 2 Detalhado',
    email: 'mock2@unicamp.br',
    lattes: 'http://lattes...',
    themes: ['Banco de Dados', 'Sistemas'],
    tags: ['Banco de Dados', 'Sistemas'],
    availableSpots: 2,
    totalSpots: 5,
    vagas: 2,
  },
  {
    id: 3,
    name: 'Prof. Mock 3 Detalhado',
    email: 'mock3@unicamp.br',
    lattes: 'http://lattes...',
    themes: ['Engenharia de Software'],
    tags: ['Engenharia de Software'],
    availableSpots: 4,
    totalSpots: 6,
    vagas: 4,
  },
  {
    id: 4,
    name: 'Prof. Carlos Mendes',
    email: 'carlos.mendes@unicamp.br',
    lattes: 'http://lattes...',
    themes: ['Web', 'Design'],
    tags: ['Web', 'Design'],
    availableSpots: 3,
    totalSpots: 5,
    vagas: 3,
  },
];

// ============================================
// ALUNOS (Students)
// ============================================
export const mockStudents = [
  {
    id: 1,
    nome: 'Yasmim Daiana',
    email: 'yasmim@unicamp.br',
    registro: '166939',
    type: 'student',
    avatar: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: 2,
    nome: 'João Silva',
    email: 'joao.silva@unicamp.br',
    registro: '166940',
    type: 'student',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: 3,
    nome: 'Maria Souza',
    email: 'maria.souza@unicamp.br',
    registro: '166941',
    type: 'student',
    avatar: 'https://i.pravatar.cc/150?u=3',
  },
  {
    id: 4,
    nome: 'Pedro Alvares',
    email: 'pedro.alvares@unicamp.br',
    registro: '166942',
    type: 'student',
    avatar: 'https://i.pravatar.cc/150?u=4',
  },
  {
    id: 5,
    nome: 'Ana Costa',
    email: 'ana.costa@unicamp.br',
    registro: '166943',
    type: 'student',
    avatar: 'https://i.pravatar.cc/150?u=5',
  },
];

// ============================================
// SOLICITAÇÕES (Requests/Solicitacoes)
// ============================================
export const mockRequests = [
  {
    semestre: '2025-1',
    data: '12/02/2025',
    envolvido: 'Maria Silva',
    status: 'Pendente',
    statusClass: 'pending',
    atualizacao: '-',
  },
  {
    semestre: '2024-2',
    data: '10/11/2024',
    envolvido: 'João Souza',
    status: 'Aceito',
    statusClass: 'accepted',
    atualizacao: '15/11/2024',
  },
  {
    semestre: '2024-2',
    data: '01/10/2024',
    envolvido: 'Pedro Alvares',
    status: 'Recusado',
    statusClass: 'rejected',
    atualizacao: '05/10/2024',
  },
  {
    semestre: '2025-1',
    data: '05/02/2025',
    envolvido: 'Carlos Mendes',
    status: 'Aceito',
    statusClass: 'accepted',
    atualizacao: '06/02/2025',
  },
  {
    semestre: '2024-2',
    data: '20/10/2024',
    envolvido: 'Ana Costa',
    status: 'Pendente',
    statusClass: 'pending',
    atualizacao: '-',
  },
];

// ============================================
// LOGS DE ATIVIDADE
// ============================================
export const mockLogs = [
  {
    semestre: '2025-1',
    login: '12/02/2025 14:00',
    logout: '12/02/2025 15:30',
    tempo: '1h 30m',
    acao: 'Visualizou Perfil',
  },
  {
    semestre: '2025-1',
    login: '10/02/2025 09:00',
    logout: '10/02/2025 09:45',
    tempo: '45m',
    acao: 'Editou Tags',
  },
  {
    semestre: '2024-2',
    login: '15/11/2024 10:00',
    logout: '15/11/2024 10:20',
    tempo: '20m',
    acao: 'Respondeu Solicitação',
  },
];

// ============================================
// ESTATÍSTICAS POR SEMESTRE
// ============================================
export const mockStatistics = {
  '2025-1': {
    recebidas: 5,
    aceitas: 1,
    recusadas: 0,
    taxaAceite: 20,
    vagasOcupadas: 1,
    vagasTotais: 5,
  },
  '2024-2': {
    recebidas: 15,
    aceitas: 5,
    recusadas: 10,
    taxaAceite: 33,
    vagasOcupadas: 5,
    vagasTotais: 5,
  },
  '2024-1': {
    recebidas: 8,
    aceitas: 4,
    recusadas: 4,
    taxaAceite: 50,
    vagasOcupadas: 4,
    vagasTotais: 6,
  },
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Retorna um professor por ID
 */
export function getProfessorById(id) {
  return mockProfessors.find((prof) => prof.id === id);
}

/**
 * Retorna um aluno por ID
 */
export function getStudentById(id) {
  return mockStudents.find((student) => student.id === id);
}

/**
 * Retorna solicitações filtradas por semestre
 */
export function getRequestsBySemester(semestre) {
  return mockRequests.filter((req) => req.semestre === semestre);
}

/**
 * Retorna logs filtrados por semestre
 */
export function getLogsBySemester(semestre) {
  return mockLogs.filter((log) => log.semestre === semestre);
}

/**
 * Retorna estatísticas de um semestre
 */
export function getStatisticsBySemester(semestre) {
  return mockStatistics[semestre] || {
    recebidas: 0,
    aceitas: 0,
    recusadas: 0,
    taxaAceite: 0,
    vagasOcupadas: 0,
    vagasTotais: 0,
  };
}
