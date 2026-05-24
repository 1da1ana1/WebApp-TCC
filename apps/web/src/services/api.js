import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      if (router.currentRoute.value.path !== '/dev-login') {
        router.push('/dev-login');
      }
    }
    return Promise.reject(error);
  },
);

export async function getTeachers() {
  try {
    const response = await api.get('/teachers');
    return response.data;
  } catch (error) {
    console.error('Error at searching teachers:', error);
    throw error;
  }
}

export async function getMyRequests() {
  const response = await api.get('/requests');
  return response.data;
}

export async function getTeacherStats() {
  const response = await api.get('/reports/teacher-stats');
  return response.data;
}

export async function getCoordinatorStats() {
  const response = await api.get('/reports/coordinator-stats');
  return response.data;
}

// ─── Contestações (Back-4) ────────────────────────────────────
// Endpoints ainda NÃO existem no backend. Os stubs abaixo lançam
// `NOT_IMPLEMENTED_ERROR` para que a UI exiba estado dedicado em
// vez de erro genérico. Quando o módulo Back-4 ficar disponível,
// substituir o corpo destas funções pelas chamadas reais — a
// assinatura e o shape esperado já estão documentados via JSDoc.

export const NOT_IMPLEMENTED_ERROR = 'NOT_IMPLEMENTED';

/**
 * @typedef {Object} ApiContestation
 * @property {number} id                  PK da contestação
 * @property {string} contestationReason  Justificativa do docente
 * @property {'PENDING'|'RESOLVED'} status
 * @property {string|null} resolvedAt     ISO date — null enquanto PENDING
 * @property {number} teacherId
 * @property {{ id: number, user: { name: string } }} [teacher]
 * @property {number|null} vacancyId
 */

/**
 * Lista contestações da coordenação logada.
 * TODO Back-4: GET /contestations?status=PENDING (recomendado: filtro por semestre ativo)
 * Esperado: { data: ApiContestation[] }  — ou array direto.
 * @returns {Promise<ApiContestation[]>}
 */
export async function getContestations() {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

/**
 * Resolve uma contestação (aceita/recusa).
 * TODO Back-4: PATCH /contestations/:id  body: { status: 'ACCEPTED'|'REJECTED', justification?: string }
 * Esperado: ApiContestation resolvido.
 * @param {number} id
 * @param {{ status: 'ACCEPTED'|'REJECTED', justification?: string }} payload
 * @returns {Promise<ApiContestation>}
 */
// eslint-disable-next-line no-unused-vars
export async function resolveContestation(id, payload) {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

// ─── Perfil de usuário visto pelo coordenador (Back-5) ────────
// Buscar docente por id já é suportado por /teachers/:id.
// Para alunos, logs e histórico de solicitações de TERCEIROS,
// os endpoints ainda não existem — stubs com TODO Back-5 abaixo.

/**
 * @typedef {Object} ApiTeacherDetail
 * @property {number} id
 * @property {string|null} lattesLink
 * @property {boolean} isCoordinator
 * @property {{ name: string, email: string, keywords?: Array<any> }} user
 * @property {Array<{ id: number, quantity: number }>} [vacancies]
 */

/**
 * Retorna o docente pelo seu id (Teacher.id).
 * Endpoint REAL: GET /teachers/:id (público).
 * @param {number|string} id
 * @returns {Promise<ApiTeacherDetail>}
 */
export async function getTeacherById(id) {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
}

/**
 * TODO Back-5: GET /students/:id — StudentsController hoje é placeholder vazio.
 * Esperado: { id, ra, user: { name, email, keywords } }.
 * @param {number|string} id
 * @returns {Promise<any>}
 */
// eslint-disable-next-line no-unused-vars
export async function getStudentById(id) {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

/**
 * @typedef {Object} ApiActivityLog
 * @property {number} id
 * @property {number} userId
 * @property {string} action       Ex: "LOGIN", "CREATE_REQUEST", "ACCEPT_STUDENT"
 * @property {string|null} loginAt   ISO datetime
 * @property {string|null} logoutAt  ISO datetime
 * @property {number|null} sessionDuration  segundos
 * @property {string} createdAt    ISO datetime
 */

/**
 * TODO Back-5: GET /users/:userId/logs?semesterId=...
 * Model `ActivityLog` já existe em schema.prisma, mas LogsController/Service estão vazios.
 * Esperado: { data: ApiActivityLog[] } ou array direto.
 * @param {number|string} userId
 * @param {{ semesterId?: number }} [params]
 * @returns {Promise<ApiActivityLog[]>}
 */
// eslint-disable-next-line no-unused-vars
export async function getUserLogs(userId, params) {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

/**
 * @typedef {Object} ApiRequestEntry
 * @property {number} id
 * @property {'PENDING'|'ACCEPTED'|'REJECTED'} status
 * @property {string} sendDate
 * @property {string|null} responseDate
 * @property {string|null} denialJustification
 * @property {{ id: number, ra: string, user: { name: string } }} [student]
 * @property {{ id: number, user: { name: string } }} [teacher]
 */

/**
 * TODO Back-5: GET /users/:userId/requests?semesterId=...
 * Hoje só existe GET /requests que retorna do usuário LOGADO — coordenador
 * precisa de um endpoint capaz de ler o histórico de OUTRO usuário.
 * Esperado: { data: ApiRequestEntry[] } ou array direto.
 * @param {number|string} userId
 * @param {{ semesterId?: number }} [params]
 * @returns {Promise<ApiRequestEntry[]>}
 */
// eslint-disable-next-line no-unused-vars
export async function getRequestsByUserId(userId, params) {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

/**
 * TODO Back-5: GET /reports/teacher-stats/:teacherId
 * Hoje /reports/teacher-stats só retorna do usuário LOGADO.
 * @param {number|string} teacherId
 * @param {{ semesterId?: number }} [params]
 * @returns {Promise<any>}
 */
// eslint-disable-next-line no-unused-vars
export async function getTeacherStatsById(teacherId, params) {
  // eslint-disable-next-line no-throw-literal
  throw { isNotImplemented: true, message: NOT_IMPLEMENTED_ERROR };
}

export async function getMyOrientations() {
  const response = await api.get('/orientations/my-orientations');
  return response.data;
}

export async function getActiveSemester() {
  const response = await api.get('/semesters/active');
  return response.data;
}

export async function defineVacancies(payload) {
  const response = await api.post('/vacancies/define', payload);
  return response.data;
}

export async function getTeacherVacancies(teacherId) {
  const response = await api.get(`/vacancies/teacher/${teacherId}`);
  return response.data;
}

export async function createSemester(payload) {
  const response = await api.post('/semesters', payload);
  return response.data;
}

export default api;
