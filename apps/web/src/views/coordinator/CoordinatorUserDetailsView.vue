<template>
  <div class="profile-page">
    <div class="container">

      <!-- Header do perfil ─────────────────────────────────── -->
      <div class="profile-card header-card">

        <div v-if="userState.isLoading" class="header-loading">
          <i class="bi bi-arrow-repeat spinner-icon"></i>
          <span>Carregando perfil...</span>
        </div>

        <div v-else-if="userState.notImplemented" class="header-pending">
          <i class="bi bi-cone-striped"></i>
          <div>
            <strong>Perfil aguardando endpoint (Back-5)</strong>
            <small>Não foi possível resolver este usuário com os endpoints atuais.</small>
          </div>
        </div>

        <div v-else-if="userState.error" class="header-error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>
            <strong>Erro ao carregar perfil</strong>
            <small>{{ userState.error }}</small>
          </div>
        </div>

        <div v-else class="profile-main">
          <div class="avatar-large">
            <img :src="user.avatar" alt="Avatar">
          </div>
          <div class="profile-info">
            <h2>{{ user.nome }}</h2>
            <span class="user-ra">
              {{ user.type === 'student' ? 'RA: ' : 'ID: ' }} {{ user.registro }}
            </span>
            <span class="user-type-badge" :class="user.type">
              {{ user.type === 'student' ? 'Discente' : user.type === 'teacher' ? 'Docente' : 'Usuário' }}
            </span>

            <div v-if="user.tags.length > 0" class="tags-container">
              <span
                v-for="(tag, idx) in user.tags"
                :key="tag"
                class="tag"
                :class="tagClass(idx)"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de abas ──────────────────────────────────────── -->
      <div class="profile-card content-card">

        <div class="tabs-header">
          <div class="tabs-nav">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'logs' }"
              @click="selectTab('logs')">
              Histórico de logs
            </button>

            <button
              class="tab-btn"
              :class="{ active: activeTab === 'requests' }"
              @click="selectTab('requests')">
              Histórico de solicitações
            </button>

            <button
              v-if="user.type === 'teacher'"
              class="tab-btn"
              :class="{ active: activeTab === 'stats' }"
              @click="selectTab('stats')">
              Estatísticas Gerais
            </button>
          </div>

          <div class="semester-filter-wrapper">
            <button
              class="btn-filter-semester"
              @click="mostrarFiltroSemestre = !mostrarFiltroSemestre">
              Semestre <i class="bi bi-funnel"></i>
            </button>

            <div v-if="mostrarFiltroSemestre" class="filter-dropdown-semester">
              <div class="filter-group">
                <label>Selecione o semestre:</label>
                <!-- TODO Back-5: substituir options estáticas por GET /semesters quando disponível -->
                <select v-model="semestreSelecionado" @change="onSemesterChange">
                  <option value="2025-1">1º Semestre 2025 (Atual)</option>
                  <option value="2024-2">2º Semestre 2024</option>
                  <option value="2024-1">1º Semestre 2024</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================
             ABA: HISTÓRICO DE LOGS
             ============================================ -->
        <div v-if="activeTab === 'logs'" class="tab-content">
          <div class="tab-header-info">
            <p>Exibindo logs de acesso referentes a <strong>{{ labelSemestre }}</strong></p>
          </div>

          <div v-if="logsState.isLoading" class="state-block">
            <i class="bi bi-arrow-repeat spinner-icon"></i>
            <p>Carregando logs...</p>
          </div>

          <div v-else-if="logsState.notImplemented" class="state-block pending">
            <i class="bi bi-cone-striped"></i>
            <p><strong>Aguardando integração (Back-5)</strong></p>
            <small>O endpoint <code>GET /users/:id/logs</code> ainda não foi disponibilizado. O modelo <code>ActivityLog</code> existe no schema, mas as rotas estão pendentes.</small>
          </div>

          <div v-else-if="logsState.error" class="state-block error">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>{{ logsState.error }}</p>
            <button class="btn-retry" @click="loadLogs">Tentar novamente</button>
          </div>

          <template v-else>
            <table class="custom-table" v-if="logs.length > 0">
              <thead>
                <tr>
                  <th>Data/Hora Login</th>
                  <th>Data/Hora Logout</th>
                  <th>Tempo</th>
                  <th>Ação Principal</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td>{{ log.loginFormatted }}</td>
                  <td>{{ log.logoutFormatted }}</td>
                  <td>{{ log.durationFormatted }}</td>
                  <td>{{ log.action }}</td>
                  <td class="actions-cell">
                    <a href="#" @click.prevent>Ver</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              Nenhum registro encontrado neste semestre.
            </div>
          </template>
        </div>

        <!-- ============================================
             ABA: HISTÓRICO DE SOLICITAÇÕES
             ============================================ -->
        <div v-if="activeTab === 'requests'" class="tab-content">
          <div class="tab-header-info">
            <p>Histórico de interações referentes a <strong>{{ labelSemestre }}</strong></p>
          </div>

          <div v-if="requestsState.isLoading" class="state-block">
            <i class="bi bi-arrow-repeat spinner-icon"></i>
            <p>Carregando solicitações...</p>
          </div>

          <div v-else-if="requestsState.notImplemented" class="state-block pending">
            <i class="bi bi-cone-striped"></i>
            <p><strong>Aguardando integração (Back-5)</strong></p>
            <small>O endpoint atual <code>GET /requests</code> retorna apenas do usuário logado. É necessário <code>GET /users/:id/requests</code> para a coordenação consultar terceiros.</small>
          </div>

          <div v-else-if="requestsState.error" class="state-block error">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>{{ requestsState.error }}</p>
            <button class="btn-retry" @click="loadRequests">Tentar novamente</button>
          </div>

          <template v-else>
            <table class="custom-table" v-if="requests.length > 0">
              <thead>
                <tr>
                  <th>Data Envio</th>
                  <th>{{ user.type === 'student' ? 'Docente' : 'Aluno' }}</th>
                  <th>Status</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in requests" :key="req.id">
                  <td>{{ req.sendDateFormatted }}</td>
                  <td>{{ req.counterpartName }}</td>
                  <td>
                    <span class="status-badge" :class="req.statusClass">{{ req.statusLabel }}</span>
                  </td>
                  <td>{{ req.responseDateFormatted }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              Nenhuma solicitação encontrada neste semestre.
            </div>
          </template>
        </div>

        <!-- ============================================
             ABA: ESTATÍSTICAS (somente docente)
             ============================================ -->
        <div v-if="activeTab === 'stats' && user.type === 'teacher'" class="tab-content">
          <div v-if="statsState.isLoading" class="state-block">
            <i class="bi bi-arrow-repeat spinner-icon"></i>
            <p>Carregando estatísticas...</p>
          </div>

          <div v-else-if="statsState.notImplemented" class="state-block pending">
            <i class="bi bi-cone-striped"></i>
            <p><strong>Aguardando integração (Back-5)</strong></p>
            <small>Atualmente <code>GET /reports/teacher-stats</code> retorna apenas do usuário logado. Necessário <code>GET /reports/teacher-stats/:teacherId</code>.</small>
          </div>

          <div v-else-if="statsState.error" class="state-block error">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>{{ statsState.error }}</p>
            <button class="btn-retry" @click="loadStats">Tentar novamente</button>
          </div>

          <div v-else-if="estatisticas" class="stats-container">
            <StatisticCard
              label="Solicitações Recebidas"
              :value="estatisticas.recebidas"
              :subtitle="'Em ' + labelSemestre"
              :performance="getPerformance('requests', estatisticas.recebidas)"
            />
            <StatisticCard
              label="Taxa de Aceite"
              :value="estatisticas.taxaAceite + '%'"
              :subtitle="estatisticas.aceitas + ' aceitas / ' + estatisticas.recusadas + ' recusadas'"
              :performance="getPerformance('acceptRate', estatisticas.taxaAceite)"
            />
            <StatisticCard
              label="Vagas Preenchidas"
              :value="estatisticas.vagasOcupadas + '/' + estatisticas.vagasTotais"
              :subtitle="vagasPctLabel"
              :performance="getPerformance('vacancies', vagasPct)"
            />
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StatisticCard from '@/components/StatisticCard.vue'
import {
  getTeacherById,
  getUserLogs,
  getRequestsByUserId,
  getTeacherStatsById,
  NOT_IMPLEMENTED_ERROR,
} from '@/services/api'

/**
 * @typedef {Object} UiLog
 * @property {number|string} id
 * @property {string} loginFormatted
 * @property {string} logoutFormatted
 * @property {string} durationFormatted
 * @property {string} action
 */

/**
 * @typedef {Object} UiRequest
 * @property {number} id
 * @property {string} sendDateFormatted
 * @property {string} responseDateFormatted
 * @property {string} counterpartName
 * @property {'pending'|'accepted'|'rejected'} statusClass
 * @property {string} statusLabel
 */

const route = useRoute()

const activeTab = ref('logs')
const semestreSelecionado = ref('2025-1')
const mostrarFiltroSemestre = ref(false)

// ── Estado do perfil ───────────────────────────────────────────
const userState = ref({ isLoading: false, error: null, notImplemented: false })
const user = ref({
  id: null,
  nome: '—',
  registro: '—',
  type: 'unknown',
  avatar: 'https://via.placeholder.com/150',
  tags: [],
})

// ── Estado por aba ─────────────────────────────────────────────
const logsState = ref({ isLoading: false, error: null, notImplemented: false, loaded: false })
const requestsState = ref({ isLoading: false, error: null, notImplemented: false, loaded: false })
const statsState = ref({ isLoading: false, error: null, notImplemented: false, loaded: false })

const logs = /** @type {import('vue').Ref<UiLog[]>} */ (ref([]))
const requests = /** @type {import('vue').Ref<UiRequest[]>} */ (ref([]))
const estatisticas = ref(null)

// ── Labels & helpers ───────────────────────────────────────────
const labelSemestre = computed(() => {
  const map = { '2025-1': '1º Sem/2025', '2024-2': '2º Sem/2024', '2024-1': '1º Sem/2024' }
  return map[semestreSelecionado.value] || semestreSelecionado.value
})

const vagasPct = computed(() => {
  if (!estatisticas.value || !estatisticas.value.vagasTotais) return 0
  return Math.round((estatisticas.value.vagasOcupadas / estatisticas.value.vagasTotais) * 100)
})
const vagasPctLabel = computed(() => `${vagasPct.value}% ocupadas`)

function tagClass(idx) {
  return ['tag-purple', 'tag-yellow', 'tag-blue'][idx % 3]
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

function formatDuration(seconds) {
  if (seconds == null) return '—'
  const s = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function extractApiError(err) {
  if (err?.isNotImplemented) return null
  const apiMsg = err?.response?.data?.message
  if (Array.isArray(apiMsg)) return apiMsg.join('; ')
  return apiMsg || err?.message || 'Falha na comunicação com o servidor.'
}

function isNotImplemented(err) {
  return err?.isNotImplemented === true || err?.message === NOT_IMPLEMENTED_ERROR
}

const STATUS_MAP = {
  PENDING:  { class: 'pending',  label: 'Pendente' },
  ACCEPTED: { class: 'accepted', label: 'Aceito' },
  REJECTED: { class: 'rejected', label: 'Recusado' },
}

// ── Normalizers API → UI ──────────────────────────────────────
function normalizeLog(raw) {
  return {
    id: raw?.id,
    loginFormatted: formatDateTime(raw?.loginAt),
    logoutFormatted: formatDateTime(raw?.logoutAt),
    durationFormatted: formatDuration(raw?.sessionDuration),
    action: raw?.action || '—',
  }
}

function normalizeRequest(raw) {
  const apiStatus = String(raw?.status || '').toUpperCase()
  const map = STATUS_MAP[apiStatus] || { class: 'pending', label: apiStatus || '—' }
  const counterpart = user.value.type === 'student'
    ? raw?.teacher?.user?.name
    : raw?.student?.user?.name
  return {
    id: raw?.id,
    sendDateFormatted: formatDate(raw?.sendDate),
    responseDateFormatted: raw?.responseDate ? formatDate(raw.responseDate) : '—',
    counterpartName: counterpart || 'Não informado',
    statusClass: map.class,
    statusLabel: map.label,
  }
}

// ── Performance helpers para StatisticCard ────────────────────
function getPerformance(metric, value) {
  if (metric === 'requests') return value >= 10 ? 'good' : value >= 5 ? 'alert' : 'danger'
  if (metric === 'acceptRate') return value >= 70 ? 'good' : value >= 50 ? 'alert' : 'danger'
  if (metric === 'vacancies') return value >= 80 ? 'good' : value >= 50 ? 'alert' : 'danger'
  return 'good'
}

// ── Loaders ───────────────────────────────────────────────────
async function loadUser() {
  userState.value = { isLoading: true, error: null, notImplemented: false }
  const id = route.params.id
  try {
    const teacher = await getTeacherById(id)
    user.value = {
      id: teacher.id,
      // userId é a chave dos logs (ActivityLog.userId) — distinta de teacher.id.
      userId: teacher.userId ?? null,
      nome: teacher.user?.name || 'Docente',
      registro: teacher.id,
      type: 'teacher',
      avatar: `https://i.pravatar.cc/150?u=${teacher.id}`,
      tags: (teacher.user?.keywords || []).map(k => k?.keyword?.name).filter(Boolean),
    }
    userState.value = { isLoading: false, error: null, notImplemented: false }
  } catch (err) {
    // 404 → provavelmente é aluno (ou id inválido). Sem GET /students/:id,
    // marcamos como pendente e mantemos a navegação funcional.
    const status = err?.response?.status
    if (status === 404) {
      user.value = {
        id,
        nome: 'Usuário',
        registro: id,
        type: 'unknown',
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        tags: [],
      }
      userState.value = { isLoading: false, error: null, notImplemented: true }
    } else if (isNotImplemented(err)) {
      userState.value = { isLoading: false, error: null, notImplemented: true }
    } else {
      userState.value = { isLoading: false, error: extractApiError(err), notImplemented: false }
    }
  }
}

async function loadLogs() {
  // Logs são indexados por User.id. Resolvemos via o perfil já carregado
  // (teacher.userId). Sem userId (ex.: aluno — depende de GET /students/:id,
  // ainda stub), tratamos como pendente em vez de consultar com id errado.
  const targetUserId = user.value.userId
  if (!targetUserId) {
    logs.value = []
    logsState.value = { isLoading: false, error: null, notImplemented: true, loaded: true }
    return
  }
  logsState.value = { isLoading: true, error: null, notImplemented: false, loaded: false }
  try {
    const raw = await getUserLogs(targetUserId, { semester: semestreSelecionado.value })
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
    logs.value = list.map(normalizeLog)
    logsState.value = { isLoading: false, error: null, notImplemented: false, loaded: true }
  } catch (err) {
    logs.value = []
    if (isNotImplemented(err)) {
      logsState.value = { isLoading: false, error: null, notImplemented: true, loaded: true }
    } else {
      logsState.value = { isLoading: false, error: extractApiError(err), notImplemented: false, loaded: true }
    }
  }
}

async function loadRequests() {
  if (!route.params.id) return
  requestsState.value = { isLoading: true, error: null, notImplemented: false, loaded: false }
  try {
    const raw = await getRequestsByUserId(route.params.id, { semester: semestreSelecionado.value })
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
    requests.value = list.map(normalizeRequest)
    requestsState.value = { isLoading: false, error: null, notImplemented: false, loaded: true }
  } catch (err) {
    requests.value = []
    if (isNotImplemented(err)) {
      requestsState.value = { isLoading: false, error: null, notImplemented: true, loaded: true }
    } else {
      requestsState.value = { isLoading: false, error: extractApiError(err), notImplemented: false, loaded: true }
    }
  }
}

async function loadStats() {
  if (user.value.type !== 'teacher' || !user.value.id) {
    statsState.value = { isLoading: false, error: null, notImplemented: true, loaded: true }
    estatisticas.value = null
    return
  }
  statsState.value = { isLoading: true, error: null, notImplemented: false, loaded: false }
  try {
    const raw = await getTeacherStatsById(user.value.id, { semester: semestreSelecionado.value })
    estatisticas.value = raw
    statsState.value = { isLoading: false, error: null, notImplemented: false, loaded: true }
  } catch (err) {
    estatisticas.value = null
    if (isNotImplemented(err)) {
      statsState.value = { isLoading: false, error: null, notImplemented: true, loaded: true }
    } else {
      statsState.value = { isLoading: false, error: extractApiError(err), notImplemented: false, loaded: true }
    }
  }
}

// ── Lazy load por aba + recarga em troca de semestre ───────────
function selectTab(tab) {
  activeTab.value = tab
  loadActiveTab()
}

function loadActiveTab() {
  if (activeTab.value === 'logs' && !logsState.value.loaded && !logsState.value.isLoading) loadLogs()
  if (activeTab.value === 'requests' && !requestsState.value.loaded && !requestsState.value.isLoading) loadRequests()
  if (activeTab.value === 'stats' && !statsState.value.loaded && !statsState.value.isLoading) loadStats()
}

function onSemesterChange() {
  // Força refetch de TODAS as abas já carregadas — o filtro de semestre
  // só fará efeito de fato quando o backend aceitar o query param.
  logsState.value.loaded = false
  requestsState.value.loaded = false
  statsState.value.loaded = false
  loadActiveTab()
}

onMounted(async () => {
  await loadUser()
  loadActiveTab()
})
</script>

<style scoped>
.profile-page {
  background-color: var(--color-background-light);
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: var(--color-background-card-default);
  border-radius: 8px;
  border: 1px solid var(--color-border-lighter);
  padding: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* HEADER DO PERFIL */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-large img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--color-background-light);
}

.profile-info h2 { margin: 0; font-size: 1.4rem; color: var(--color-text-gray); }

.user-ra {
  font-weight: 600;
  color: var(--color-text-light-gray);
  display: block;
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.user-type-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.user-type-badge.student { background: var(--color-badge-student-bg); color: var(--color-badge-student-text); }
.user-type-badge.teacher { background: var(--color-badge-teacher-bg); color: var(--color-badge-teacher-text); }
.user-type-badge.unknown { background: #eee; color: #666; }

.tags-container { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }

.tag { padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; }
.tag-purple { background-color: var(--color-tag-coord-purple); color: var(--color-tag-coord-purple-text); }
.tag-yellow { background-color: var(--color-tag-coord-yellow); color: var(--color-tag-coord-yellow-text); }
.tag-blue   { background-color: var(--color-tag-coord-blue); color: var(--color-tag-coord-blue-text); }

/* Header states */
.header-loading, .header-pending, .header-error {
  display: flex; align-items: center; gap: 1rem; width: 100%; color: #555;
}
.header-loading i { font-size: 1.6rem; color: #065f8b; }
.header-pending i { font-size: 1.6rem; color: #e67e22; }
.header-error i   { font-size: 1.6rem; color: #c0392b; }
.header-pending small, .header-error small { display: block; font-size: 0.8rem; color: #888; }

/* FILTRO DE SEMESTRE */
.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 1rem;
}

.semester-filter-wrapper { position: relative; }

.btn-filter-semester {
  background-color: var(--color-button-primary);
  color: var(--color-icon-white);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-family: poppins, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-filter-semester:hover { opacity: 0.9; }

.filter-dropdown-semester {
  position: absolute;
  top: 110%;
  right: 0;
  background: var(--color-background-card-default);
  border: 1px solid var(--color-border-lighter);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 250px;
  z-index: 10;
  margin-top: 0.5rem;
}

.filter-dropdown-semester .filter-group { margin: 0; display: flex; flex-direction: column; }
.filter-dropdown-semester label { font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--color-text-subtle); }
.filter-dropdown-semester select {
  padding: 0.5rem;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  font-family: poppins, sans-serif;
  font-size: 0.9rem;
}

/* ABAS */
.tabs-nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  border-bottom: 1px solid var(--color-border-lightest);
  margin-bottom: 2.5rem;
  font-family: poppins, sans-serif;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  font-family: poppins, sans-serif;
}

.tab-btn:hover { color: var(--color-text-gray); }
.tab-btn.active {
  color: var(--color-brand-primary, #004b86);
  border-bottom-color: var(--color-brand-primary, #004b86);
}

/* CONTEÚDO DAS ABAS */
.tab-header-info { margin-bottom: 1rem; color: var(--color-text-light-gray); font-size: 0.9rem; }

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th {
  text-align: left;
  padding: 1rem;
  color: var(--color-text-gray);
  font-weight: 600;
  border-bottom: 2px solid var(--color-border-lightest);
}
.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-lightest);
  color: var(--color-text-subtle);
  font-size: 0.9rem;
}

.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.status-badge.pending  { background: #fff3e0; color: #ef6c00; }
.status-badge.accepted { background: #e8f5e9; color: #2e7d32; }
.status-badge.rejected { background: #ffebee; color: #c62828; }

.actions-cell a { color: #1976d2; text-decoration: none; font-weight: 500; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-lightest);
  font-style: italic;
}

/* ESTATÍSTICAS CARDS */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* ── Estados unificados (loading/empty/error/pending) ───────── */
.state-block {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6rem; padding: 3rem 1rem; color: #666; text-align: center;
}
.state-block i { font-size: 2rem; color: #aaa; }
.state-block.error i   { color: #c0392b; }
.state-block.error p   { color: #9b1c1c; }
.state-block.pending i { color: #e67e22; }
.state-block.pending p { color: #444; }
.state-block.pending small { color: #888; font-size: 0.85rem; max-width: 480px; }
.state-block code {
  background: rgba(0,0,0,0.06); padding: 1px 6px; border-radius: 4px;
  font-family: 'Courier New', monospace; font-size: 0.8rem;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner-icon { display: inline-block; animation: spin 0.8s linear infinite; font-size: 2rem; color: #065f8b; }
.header-loading .spinner-icon, .header-pending i, .header-error i { font-size: 1.6rem; }

.btn-retry {
  background: transparent;
  border: 1px solid #065f8b;
  color: #065f8b;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-family: poppins, sans-serif;
  font-weight: 500;
}
.btn-retry:hover { background: #e1f0fa; }
</style>
