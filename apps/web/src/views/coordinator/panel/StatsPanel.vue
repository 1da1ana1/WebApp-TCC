<template>
  <div class="statistics-view">
    <h2 class="view-title">Estatísticas e Monitoramento</h2>

    <div class="stats-container-border">

      <nav class="sub-tabs-nav">
        <button
          :class="{ active: currentStatsTab === 'overview' }"
          @click="selectTab('overview')">Visão Geral</button>
        <button
          :class="{ active: currentStatsTab === 'funnel' }"
          @click="selectTab('funnel')">Funil de Vinculação</button>
        <button
          :class="{ active: currentStatsTab === 'risks' }"
          @click="selectTab('risks')">Riscos &amp; Gargalos</button>
      </nav>

      <div class="stats-inner-content">

        <!-- ============================================================
             VISÃO GERAL — integrado com GET /reports/coordinator-stats
             ============================================================ -->
        <div v-if="currentStatsTab === 'overview'" class="sub-view-overview">

          <div v-if="overview.isLoading" class="state-block">
            <i class="bi bi-arrow-repeat spinner-icon"></i>
            <p>Carregando estatísticas...</p>
          </div>

          <div v-else-if="overview.error" class="state-block error">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>{{ overview.error }}</p>
            <button class="btn-action-outline" @click="loadOverview">Tentar novamente</button>
          </div>

          <div v-else-if="overview.isEmpty" class="state-block empty">
            <i class="bi bi-inbox"></i>
            <p>Sem dados suficientes para exibir estatísticas.</p>
          </div>

          <div v-else class="overview-grid">

            <div class="stat-gray-card left">
              <div class="card-header-row">
                <h4>Saúde do Processo</h4>
                <span class="badge-status" :class="healthStatus.variant">{{ healthStatus.label }}</span>
              </div>

              <div class="kpi-list">
                <div class="kpi-item">
                  <span class="kpi-label">Total de Alunos Matriculados</span>
                  <span class="kpi-value">{{ formatKpi(totalStudents) }}</span>
                </div>

                <div class="kpi-item">
                  <span class="kpi-label">Vagas Totais Ofertadas</span>
                  <span class="kpi-value" :class="{ 'text-danger': vacancyDeficit > 0 }">
                    {{ formatKpi(totalVacancies) }}
                    <i v-if="vacancyDeficit > 0" class="bi bi-exclamation-circle-fill" :title="`Déficit de ${vacancyDeficit} vagas!`"></i>
                  </span>
                </div>

                <div class="divider-line"></div>

                <div class="kpi-item" :class="{ 'highlight-risk': studentsWithoutOrientation > 0 }">
                  <span class="kpi-label">Alunos SEM Orientador (Risco)</span>
                  <span class="kpi-value" :class="{ 'text-danger': studentsWithoutOrientation > 0 }">
                    {{ formatKpi(studentsWithoutOrientation) }}
                  </span>
                </div>

                <div class="kpi-item">
                  <span class="kpi-label">Docentes com vagas sobrando</span>
                  <span class="kpi-value text-success">{{ formatKpi(teachersWithSurplus) }}</span>
                </div>
              </div>

              <div class="card-footer-actions">
                <button class="btn-export-yellow" :disabled="!studentsWithoutOrientation" @click="onExportUnlinked">
                  Baixar relatório de alunos sem vínculo
                </button>
              </div>
            </div>

            <div class="stat-gray-card right">
              <h4>Prazo da Etapa Atual</h4>

              <template v-if="currentPhase">
                <p class="phase-label">Fase: <strong>{{ currentPhase.label }}</strong></p>

                <div class="phase-widget">
                  <div class="phase-header">
                    <span class="phase-period">{{ formatRange(currentPhase.start, currentPhase.end) }}</span>
                    <span class="phase-status" :class="phaseUrgencyClass">
                      <template v-if="currentPhase.daysLeft > 0">
                        Restam <strong>{{ currentPhase.daysLeft }}</strong> dia{{ currentPhase.daysLeft === 1 ? '' : 's' }}
                      </template>
                      <template v-else>
                        Encerrado
                      </template>
                    </span>
                  </div>
                  <div class="phase-progress">
                    <div class="phase-progress-bar" :style="{ width: phaseProgressPct + '%' }"></div>
                  </div>
                </div>
              </template>

              <template v-else>
                <p class="phase-label">
                  <em>{{ activeSemester ? 'Fora do período de qualquer etapa configurada.' : 'Nenhum semestre ativo encontrado.' }}</em>
                </p>
              </template>

              <div class="card-footer-actions">
                <button class="btn-action-outline" :disabled="!currentPhase" @click="onExtendDeadline">
                  Estender prazo (+2 dias)
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- ============================================================
             FUNIL — estrutura preparada para expansão (placeholder)
             ============================================================ -->
        <div v-else-if="currentStatsTab === 'funnel'" class="sub-view-charts">
          <div class="charts-grid">
            <div class="chart-card wide">
              <div class="chart-header">
                <h5>Funil de Vinculação</h5>
                <small>Progresso dos alunos no processo</small>
              </div>
              <div class="state-block empty inline">
                <i class="bi bi-bar-chart-line"></i>
                <p>Em breve — aguardando endpoint do funil de vinculação.</p>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Interesse por Área</h5>
                  <small>Onde os alunos estão focando?</small>
                </div>
              </div>
              <div class="state-block empty inline">
                <i class="bi bi-pie-chart"></i>
                <p>Em breve — aguardando endpoint de distribuição por área.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             RISCOS — estrutura preparada para expansão (placeholder)
             ============================================================ -->
        <div v-else-if="currentStatsTab === 'risks'" class="sub-view-charts">
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Vagas "Encalhadas"</h5>
                  <small>Docentes com baixa procura</small>
                </div>
              </div>
              <div class="state-block empty inline">
                <i class="bi bi-bar-chart"></i>
                <p>Em breve — aguardando endpoint de vagas com baixa procura.</p>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Docentes Sobrecarregados</h5>
                  <small>Maior nº de recusas enviadas</small>
                </div>
              </div>
              <!-- Já temos overloadedTeachers vindo de /reports/coordinator-stats:
                   exibimos um preview enxuto até o endpoint dedicado existir. -->
              <div v-if="overloadedTeachers.length > 0" class="overloaded-list">
                <div v-for="t in overloadedTeachers" :key="t.name" class="overloaded-row">
                  <span class="overloaded-name">{{ t.name }}</span>
                  <span class="overloaded-count">{{ t.rejections }} recusa{{ t.rejections === 1 ? '' : 's' }}</span>
                </div>
              </div>
              <div v-else class="state-block empty inline">
                <i class="bi bi-people"></i>
                <p>Sem dados de sobrecarga para o semestre atual.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCoordinatorStats, getActiveSemester } from '@/services/api'

const currentStatsTab = ref('overview')

// ── Slots de estado por aba — preparados para expansão ─────────
// Cada aba terá seu próprio loader assim que ganhar endpoint dedicado.
const overview = ref({ isLoading: false, error: null, isEmpty: false })
const funnel = ref({ isLoading: false, error: null, isEmpty: true, data: null })
const risks = ref({ isLoading: false, error: null, isEmpty: true, data: null })

// Dados da Visão Geral
const stats = ref(null)
const activeSemester = ref(null)

// ── KPIs derivados ─────────────────────────────────────────────
// Campos opcionais (totalVacancies, teachersWithSurplus) já estão
// previstos — quando o backend incluí-los na resposta de
// /reports/coordinator-stats, a UI exibe automaticamente.
const totalStudents = computed(() => stats.value?.totalStudents ?? null)
const studentsWithoutOrientation = computed(() => stats.value?.studentsWithoutOrientation ?? null)
const totalVacancies = computed(() => stats.value?.totalVacancies ?? null)
const teachersWithSurplus = computed(() => stats.value?.teachersWithSurplus ?? null)
const overloadedTeachers = computed(() => stats.value?.overloadedTeachers ?? [])

const vacancyDeficit = computed(() => {
  const t = totalStudents.value
  const v = totalVacancies.value
  if (t == null || v == null) return 0
  return Math.max(t - v, 0)
})

const healthStatus = computed(() => {
  const risk = studentsWithoutOrientation.value
  if (risk == null) return { label: 'Sem dados', variant: 'neutral' }
  if (risk === 0) return { label: 'Saudável', variant: 'success' }
  if (risk > 10 || vacancyDeficit.value > 0) return { label: 'Atenção Necessária', variant: 'warning' }
  return { label: 'Em monitoramento', variant: 'info' }
})

// ── Etapa atual do semestre ativo ──────────────────────────────
const PHASE_DEFINITIONS = [
  { label: 'Definição de vagas',          startKey: 'vacancyDefStartDate',   endKey: 'vacancyDefEndDate' },
  { label: 'Cadastro de temas',           startKey: 'themeRegStartDate',     endKey: 'themeRegEndDate' },
  { label: 'Busca de orientadores',       startKey: 'searchStartDate',       endKey: 'searchEndDate' },
  { label: 'Análise de solicitações',     startKey: 'analysisStartDate',     endKey: 'analysisEndDate' },
  { label: 'Confirmação de vínculo',      startKey: 'linkConfirmStartDate',  endKey: 'linkConfirmEndDate' },
]

const currentPhase = computed(() => {
  const sem = activeSemester.value
  if (!sem) return null
  const today = new Date()
  for (const def of PHASE_DEFINITIONS) {
    const start = sem[def.startKey] ? new Date(sem[def.startKey]) : null
    const end = sem[def.endKey] ? new Date(sem[def.endKey]) : null
    if (!start || !end) continue
    if (today >= start && today <= end) {
      const ms = end.getTime() - today.getTime()
      const daysLeft = Math.max(Math.ceil(ms / 86400000), 0)
      return { label: def.label, start, end, daysLeft }
    }
  }
  return null
})

const phaseProgressPct = computed(() => {
  if (!currentPhase.value) return 0
  const { start, end } = currentPhase.value
  const total = end.getTime() - start.getTime()
  const done = Date.now() - start.getTime()
  if (total <= 0) return 100
  return Math.min(Math.max(Math.round((done / total) * 100), 0), 100)
})

const phaseUrgencyClass = computed(() => {
  const d = currentPhase.value?.daysLeft ?? null
  if (d == null) return ''
  if (d <= 2) return 'urgent'
  if (d <= 7) return 'soon'
  return 'ok'
})

// ── Helpers de UI ──────────────────────────────────────────────
function formatKpi(value) {
  return value == null ? '—' : value
}

function formatRange(start, end) {
  if (!start || !end) return ''
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
  return `${fmt.format(start)} → ${fmt.format(end)}`
}

function extractApiError(err) {
  const apiMsg = err?.response?.data?.message
  if (Array.isArray(apiMsg)) return apiMsg.join('; ')
  return apiMsg || err?.message || 'Falha ao carregar estatísticas.'
}

// ── Loaders ────────────────────────────────────────────────────
async function loadOverview() {
  overview.value = { isLoading: true, error: null, isEmpty: false }
  try {
    const [statsResult, semesterResult] = await Promise.allSettled([
      getCoordinatorStats(),
      getActiveSemester(),
    ])

    if (statsResult.status === 'rejected') throw statsResult.reason
    stats.value = statsResult.value ?? null
    activeSemester.value = semesterResult.status === 'fulfilled' ? (semesterResult.value ?? null) : null

    const empty = !stats.value || (
      stats.value.totalStudents == null &&
      stats.value.studentsWithoutOrientation == null
    )
    overview.value = { isLoading: false, error: null, isEmpty: empty }
  } catch (err) {
    stats.value = null
    overview.value = { isLoading: false, error: extractApiError(err), isEmpty: false }
  }
}

// Slots prontos para os próximos endpoints.
// Quando existirem, substituir o corpo abaixo pela chamada real
// (ex.: getCoordinatorFunnel(), getCoordinatorRisks()).
async function loadFunnel() {
  funnel.value = { isLoading: false, error: null, isEmpty: true, data: null }
}
async function loadRisks() {
  risks.value = { isLoading: false, error: null, isEmpty: true, data: null }
}

function selectTab(tab) {
  currentStatsTab.value = tab
  if (tab === 'overview' && !stats.value && !overview.value.isLoading) loadOverview()
  if (tab === 'funnel' && !funnel.value.data && !funnel.value.isLoading) loadFunnel()
  if (tab === 'risks' && !risks.value.data && !risks.value.isLoading) loadRisks()
}

function onExportUnlinked() {
  // TODO: integrar com endpoint de export (ex.: /reports/unlinked-students.csv)
}
function onExtendDeadline() {
  // TODO: integrar com endpoint de extensão de prazo da etapa atual
}

onMounted(loadOverview)
</script>

<style scoped>
.statistics-view {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.view-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
  font-size: 1.5rem;
}

.stats-container-border {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0;
  background: #fff;
}

/* --- ABAS INTERNAS --- */
.sub-tabs-nav {
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.sub-tabs-nav button {
  background: none;
  border: none;
  padding-bottom: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.2s;
}

.sub-tabs-nav button.active {
  color: var(--color-brand-primary, #065f8b);
  border-bottom-color: var(--color-brand-primary, #065f8b);
  font-weight: 600;
}

.stats-inner-content {
  padding: 0 2rem 2rem;
}

/* --- VISÃO GERAL (KPIs) --- */
.overview-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
}

.stat-gray-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.card-header-row h4 { margin: 0; font-size: 1.1rem; color: #333; }

.badge-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-status.warning { background-color: #fff3cd; color: #856404; }
.badge-status.success { background-color: #d1f5e0; color: #1a7a45; }
.badge-status.info    { background-color: #d0e8f7; color: #065f8b; }
.badge-status.neutral { background-color: #e9ecef; color: #555; }

.kpi-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.kpi-label { color: #555; font-size: 0.95rem; }
.kpi-value { font-weight: 700; font-size: 1.1rem; color: #000; }

.text-danger { color: #dc3545 !important; }
.text-success { color: #28a745 !important; }

.divider-line { height: 1px; background: #ddd; margin: 0.5rem 0; }

.highlight-risk {
  background-color: #ffebee;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
}

/* Botões */
.btn-export-yellow {
  background-color: #ffc107;
  border: none; padding: 10px; border-radius: 6px;
  font-weight: 600; cursor: pointer; width: 100%;
  margin-top: 1rem; color: #000;
  font-family: 'Poppins', sans-serif;
}
.btn-export-yellow:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-action-outline {
  background: transparent; border: 1px solid #065f8b;
  color: #065f8b; padding: 8px; border-radius: 6px;
  cursor: pointer; width: 100%; font-weight: 500;
  font-family: 'Poppins', sans-serif;
}
.btn-action-outline:disabled { opacity: 0.55; cursor: not-allowed; }

/* --- Widget de Etapa Atual (substitui calendário mock) --- */
.phase-label { color: #444; margin: 0.25rem 0 1rem; }
.phase-widget { background: white; border: 1px solid #eee; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.phase-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.9rem; }
.phase-period { color: #555; font-weight: 500; }
.phase-status.ok      { color: #1a7a45; }
.phase-status.soon    { color: #e67e22; }
.phase-status.urgent  { color: #c0392b; }
.phase-progress { height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
.phase-progress-bar { height: 100%; background: linear-gradient(90deg, #065f8b, #63a4ff); transition: width 0.4s ease; }

/* --- Estados (loading/error/empty) --- */
.state-block {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6rem; padding: 3rem 1rem; color: #666; text-align: center;
}
.state-block i { font-size: 2rem; color: #aaa; }
.state-block.error i { color: #c0392b; }
.state-block.error p { color: #9b1c1c; }
.state-block.empty.inline { padding: 1.5rem; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner-icon { display: inline-block; animation: spin 0.8s linear infinite; font-size: 2rem; color: #065f8b; }

/* --- GRÁFICOS E FUNIL (estrutura preservada) --- */
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.chart-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; min-height: 200px; }
.chart-card.wide { grid-column: span 2; }

.chart-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.chart-header h5 { margin: 0; font-size: 1rem; color: #333; }
.chart-header small { color: #777; font-size: 0.8rem; }

/* --- Lista de docentes sobrecarregados (preview a partir do endpoint atual) --- */
.overloaded-list { display: flex; flex-direction: column; gap: 0.5rem; }
.overloaded-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border: 1px solid #eee; border-radius: 6px;
  padding: 8px 12px; font-size: 0.9rem;
}
.overloaded-name { color: #333; font-weight: 500; }
.overloaded-count { color: #c0392b; font-weight: 600; font-size: 0.85rem; }

@media (max-width: 900px) {
  .overview-grid, .charts-grid { grid-template-columns: 1fr; }
  .chart-card.wide { grid-column: span 1; }
  .sub-tabs-nav { flex-wrap: wrap; gap: 1rem; }
}
</style>
