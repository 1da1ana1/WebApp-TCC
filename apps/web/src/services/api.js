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

export async function getTeacherStats(semesterId) {
  const response = await api.get('/reports/teacher-stats', {
    params: semesterId != null ? { semesterId } : {},
  });
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
 * Lista as contestações pendentes (coordenador).
 * GET /contestations — retorna array de ApiContestation com status PENDING,
 * incluindo `teacher.user` e `vacancy`.
 * @returns {Promise<ApiContestation[]>}
 */
export async function getContestations() {
  const response = await api.get('/contestations');
  return response.data;
}

/**
 * Resolve uma contestação (aceita/recusa) — coordenador.
 * PATCH /contestations/:id
 *   body: { status: 'ACCEPTED'|'REJECTED', newQuantity?: number, justification?: string }
 *   `newQuantity` é obrigatório quando status=ACCEPTED (vira a nova Vacancy.quantity).
 * @param {number} id
 * @param {{ status: 'ACCEPTED'|'REJECTED', newQuantity?: number, justification?: string }} payload
 * @returns {Promise<ApiContestation>}
 */
export async function resolveContestation(id, payload) {
  const response = await api.patch(`/contestations/${id}`, payload);
  return response.data;
}

// ─── Perfil de usuário visto pelo coordenador (Back-5) ────────
// Buscar docente por id já é suportado por /teachers/:id.
// Para alunos, logs e histórico de solicitações de TERCEIROS,
// os endpoints ainda não existem — stubs com TODO Back-5 abaixo.

/**
 * @typedef {Object} ApiTeacherDetail
 * @property {number} id
 * @property {number} userId
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
 * Logs de atividade de um usuário (paginado, mais recentes primeiro).
 * GET /logs/user/:userId?page&pageSize — retorna
 * { data: ApiActivityLog[], page, pageSize, total, totalPages }.
 * (O backend ainda não filtra por semestre; params extras são ignorados.)
 * @param {number|string} userId
 * @param {{ page?: number, pageSize?: number }} [params]
 * @returns {Promise<{ data: ApiActivityLog[], page: number, pageSize: number, total: number, totalPages: number }>}
 */
export async function getUserLogs(userId, params = {}) {
  const response = await api.get(`/logs/user/${userId}`, { params });
  return response.data;
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
 * Solicitações de um usuário (coordenador) — onde ele é aluno OU professor.
 * GET /requests/user/:userId — inclui student/teacher + keywords.
 * @param {number|string} userId  User.id do alvo
 * @param {object} [params]
 * @returns {Promise<ApiRequestEntry[]>}
 */
export async function getRequestsByUserId(userId, params = {}) {
  const response = await api.get(`/requests/user/${userId}`, { params });
  return response.data;
}

/**
 * Estatísticas de um docente por User.id (coordenador).
 * GET /reports/teacher-stats/:id (aceita ?semesterId).
 * @param {number|string} userId  User.id do docente alvo
 * @param {{ semesterId?: number }} [params]
 * @returns {Promise<any>}
 */
export async function getTeacherStatsById(userId, params = {}) {
  const response = await api.get(`/reports/teacher-stats/${userId}`, { params });
  return response.data;
}

export async function getMyOrientations() {
  const response = await api.get('/orientations/my-orientations');
  return response.data;
}

export async function getActiveSemester() {
  const response = await api.get('/semesters/active');
  return response.data;
}

export async function getSemesters() {
  const response = await api.get('/semesters');
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

export async function getKeywords() {
  const response = await api.get('/keywords');
  return response.data;
}

export async function getStudentProfile() {
  const response = await api.get('/students/me');
  return response.data;
}

export async function updateStudentKeywords(keywordIds) {
  const response = await api.put('/keywords/me', { keywordIds });
  return response.data;
}

export async function getTeacherRequests() {
  const response = await api.get('/requests');
  return response.data;
}

export async function respondRequest(id, status, justification) {
  const body = { status };
  if (justification) {
    body.denialJustification = justification;
  }
  const response = await api.patch(`/requests/${id}/respond`, body);
  return response.data;
}

// ─── Notificações (RF003) ─────────────────────────────────────
/**
 * @typedef {Object} ApiNotification
 * @property {number} id
 * @property {number} userId
 * @property {string} type    NEW_REQUEST | REQUEST_RESPONSE | VACANCY_DEFINED | CONTESTATION
 * @property {string} title
 * @property {string} body
 * @property {boolean} read
 * @property {string|null} link
 * @property {string} createdAt
 */

/**
 * Notificações do usuário autenticado (mais recentes primeiro).
 * @returns {Promise<ApiNotification[]>}
 */
export async function getNotifications() {
  const response = await api.get('/notifications/me');
  return response.data;
}

/**
 * Marca uma notificação como lida.
 * @param {number} id
 * @returns {Promise<ApiNotification>}
 */
export async function markNotificationRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

export default api;
