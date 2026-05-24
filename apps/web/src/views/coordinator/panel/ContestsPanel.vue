<template>
  <div class="view-contests">
    <h2 class="view-title">Vagas contestadas</h2>

    <!-- Loading ─────────────────────────────────────────────── -->
    <div v-if="isLoading" class="state-block">
      <i class="bi bi-arrow-repeat spinner-icon"></i>
      <p>Carregando contestações...</p>
    </div>

    <!-- Endpoint ainda não implementado (Back-4) ─────────────── -->
    <div v-else-if="notImplemented" class="state-block pending">
      <i class="bi bi-cone-striped"></i>
      <p><strong>Funcionalidade aguardando integração (Back-4)</strong></p>
      <small>Os endpoints de contestações ainda não foram disponibilizados pelo backend.</small>
    </div>

    <!-- Erro de comunicação ──────────────────────────────────── -->
    <div v-else-if="error" class="state-block error">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <p>{{ error }}</p>
      <button class="btn-modal-cancel" @click="loadContests">Tentar novamente</button>
    </div>

    <!-- Lista normal (vazia ou com dados) ─────────────────────── -->
    <div v-else class="contests-table-container">
      <div class="contest-header-row">
        <div class="col-docente">Docente</div>
        <div class="col-justificativa">Justificativa</div>
        <div class="col-situacao">Situação</div>
      </div>

      <div class="contest-list">
        <div v-for="contest in contests" :key="contest.id" class="contest-row">
          <div class="col-docente">
            <div class="contest-avatar">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="contest-info">
              <span class="contest-name">{{ contest.teacherName }}</span>
              <span class="contest-id">{{ contest.teacherId }}</span>
            </div>
          </div>

          <div class="col-justificativa">
            <div class="reason-box">
              {{ contest.reason }}
            </div>
          </div>

          <div class="col-situacao">
            <div v-if="contest.status === 'pending'" class="contest-actions">
              <button class="btn-contest-action btn-accept" :disabled="contest.isResolving" @click="openAcceptContest(contest)">Aceitar</button>
              <button class="btn-contest-action btn-reject" :disabled="contest.isResolving" @click="openRejectContest(contest)">Recusar</button>
            </div>

            <div v-else class="contest-status-badge" :class="contest.status">
              <span>{{ contest.status === 'accepted' ? 'Aceita' : 'Recusada' }}</span>
              <button class="btn-dismiss" @click="removeContest(contest.id)"><i class="bi bi-x-square"></i></button>
            </div>
          </div>
        </div>

        <div v-if="contests.length === 0" class="empty-list-state">
          <i class="bi bi-inbox"></i>
          <p>Nenhuma contestação pendente.</p>
        </div>
      </div>
    </div>

    <!-- Modal de recusa (gated por notImplemented) ─────────── -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-card">
        <h3>Por favor, insira a justificativa da recusa:</h3>
        <div class="modal-form">
          <label>Selecione um motivo:</label>
          <select v-model="rejectReason" class="modal-select">
            <option value="" disabled selected>Selecione...</option>
            <option value="Justificativa insuficiente">Justificativa insuficiente</option>
            <option value="Sem saldo de vagas">Sem saldo de vagas no curso</option>
            <option value="Fora do prazo">Solicitação fora do prazo</option>
            <option value="Outro">Outro motivo não listado</option>
          </select>
          <div class="textarea-container">
            <label>Detalhes (Opcional se selecionar motivo):</label>
            <textarea v-model="rejectCustomReason" placeholder="Digite a justificativa..." rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="closeRejectModal">Cancelar</button>
          <button class="btn-modal-confirm" :disabled="isResolvingActive" @click="confirmRejectAction">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import {
  getContestations,
  resolveContestation,
  NOT_IMPLEMENTED_ERROR,
} from '@/services/api'

/**
 * @typedef {Object} UiContestation
 * @property {number} id            PK da contestação (backend)
 * @property {number} teacherId     PK do docente (para o fluxo de Definição de vagas)
 * @property {string} teacherName
 * @property {string} reason
 * @property {'pending'|'accepted'|'rejected'} status
 * @property {boolean} isResolving  Flag de loading por linha
 */

const emit = defineEmits(['accepted'])

// ── Estado da listagem ─────────────────────────────────────────
const contests = /** @type {import('vue').Ref<UiContestation[]>} */ (ref([]))
const isLoading = ref(false)
const error = ref(null)
const notImplemented = ref(false)

// ── Estado do modal de recusa ──────────────────────────────────
const showRejectModal = ref(false)
const activeContestItem = /** @type {import('vue').Ref<UiContestation|null>} */ (ref(null))
const rejectReason = ref('')
const rejectCustomReason = ref('')

const isResolvingActive = computed(() => activeContestItem.value?.isResolving === true)

// ── Mapper API → UI ────────────────────────────────────────────
function normalizeContestation(raw) {
  // Mantém compatibilidade com payload em array direto ou envelopado.
  const apiStatus = String(raw?.status || '').toUpperCase()
  return {
    id: Number(raw?.id),
    teacherId: Number(raw?.teacherId ?? raw?.teacher?.id),
    teacherName: raw?.teacher?.user?.name || 'Docente desconhecido',
    reason: raw?.contestationReason || '',
    // Backend hoje só tem PENDING/RESOLVED. Quando a distinção
    // accepted/rejected ficar disponível, ajustar aqui.
    status: apiStatus === 'RESOLVED' ? 'accepted' : 'pending',
    isResolving: false,
  }
}

function extractApiError(err) {
  if (err?.isNotImplemented) return null
  const apiMsg = err?.response?.data?.message
  if (Array.isArray(apiMsg)) return apiMsg.join('; ')
  return apiMsg || err?.message || 'Falha ao carregar contestações.'
}

// ── Loader ─────────────────────────────────────────────────────
async function loadContests() {
  isLoading.value = true
  error.value = null
  notImplemented.value = false
  try {
    const raw = await getContestations()
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
    contests.value = list.map(normalizeContestation)
  } catch (err) {
    if (err?.isNotImplemented || err?.message === NOT_IMPLEMENTED_ERROR) {
      notImplemented.value = true
      contests.value = []
    } else {
      error.value = extractApiError(err)
      contests.value = []
    }
  } finally {
    isLoading.value = false
  }
}

// ── Ações: aceitar / recusar (passam pelo stub Back-4) ─────────
async function openAcceptContest(contest) {
  if (contest.isResolving) return
  contest.isResolving = true
  try {
    await resolveContestation(contest.id, { status: 'ACCEPTED' })
    contest.status = 'accepted'
    Swal.fire({
      title: 'Solicitação aceita com sucesso!',
      text: 'Você está sendo redirecionado para a página de Definição de vagas para realizar o ajuste.',
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      willClose: () => {
        emit('accepted', {
          id: contest.teacherId,
          name: contest.teacherName,
          contestationId: contest.id,
        })
      },
    })
  } catch (err) {
    if (err?.isNotImplemented) {
      Swal.fire({
        icon: 'info',
        title: 'Endpoint pendente (Back-4)',
        text: 'A persistência da decisão será habilitada quando o backend de contestações estiver disponível.',
        confirmButtonColor: '#065f8b',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao aceitar contestação',
        text: extractApiError(err) || 'Tente novamente.',
        confirmButtonColor: '#c0392b',
      })
    }
  } finally {
    contest.isResolving = false
  }
}

function openRejectContest(contest) {
  activeContestItem.value = contest
  rejectReason.value = ''
  rejectCustomReason.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  activeContestItem.value = null
}

async function confirmRejectAction() {
  const contest = activeContestItem.value
  if (!contest || contest.isResolving) return

  const justification = rejectCustomReason.value?.trim() || rejectReason.value
  if (!justification) {
    Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Informe um motivo para a recusa.' })
    return
  }

  contest.isResolving = true
  try {
    await resolveContestation(contest.id, { status: 'REJECTED', justification })
    contest.status = 'rejected'
    Swal.fire({
      icon: 'info',
      title: 'Contestação Recusada',
      text: 'A justificativa foi enviada ao docente.',
      timer: 1500,
      showConfirmButton: false,
    })
    closeRejectModal()
  } catch (err) {
    if (err?.isNotImplemented) {
      Swal.fire({
        icon: 'info',
        title: 'Endpoint pendente (Back-4)',
        text: 'A recusa será persistida quando o backend de contestações estiver disponível.',
        confirmButtonColor: '#065f8b',
      })
      closeRejectModal()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao recusar contestação',
        text: extractApiError(err) || 'Tente novamente.',
        confirmButtonColor: '#c0392b',
      })
    }
  } finally {
    contest.isResolving = false
  }
}

function removeContest(id) {
  // Remoção local da linha já resolvida — apenas UI, não toca no backend.
  contests.value = contests.value.filter(c => c.id !== id)
}

onMounted(loadContests)
</script>

<style scoped>
@import './panelStyles.css';

.contests-table-container { margin-top: 1rem; }
.contest-header-row { display: grid; grid-template-columns: 3fr 4fr 2fr; gap: 2rem; padding: 0 1rem 1rem 1rem; border-bottom: 2px solid #000; font-weight: 800; font-style: italic; color: #000; font-size: 0.95rem; }
.contest-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; max-height: 450px; overflow-y: auto; }
.contest-row { display: grid; grid-template-columns: 3fr 4fr 2fr; gap: 2rem; align-items: center; padding: 1rem; border-bottom: 1px solid #e0e0e0; }
.col-docente { display: flex; align-items: center; gap: 1rem; }
.contest-avatar { width: 40px; height: 40px; background-color: #1e1e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0; }
.contest-info { display: flex; flex-direction: column; }
.contest-name { font-weight: 600; font-size: 0.85rem; color: #000; }
.contest-id { font-size: 0.75rem; color: #555; }
.reason-box { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; font-size: 0.85rem; color: #555; background: #fff; min-height: 40px; display: flex; align-items: center; }
.contest-actions { display: flex; gap: 0.8rem; }
.btn-contest-action { border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: white; flex: 1; transition: opacity 0.2s; font-family: 'Poppins', sans-serif; }
.btn-contest-action:hover { opacity: 0.9; }
.btn-contest-action:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-accept { background-color: #28a745; }
.btn-reject { background-color: #dc3545; }
.contest-status-badge { display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: space-between; }
.contest-status-badge span { background-color: #a0a0a0; color: white; padding: 6px 20px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; font-style: italic; flex: 1; text-align: center; }
.contest-status-badge.accepted span { background-color: #a0a0a0; }
.contest-status-badge.rejected span { background-color: #a0a0a0; }
.btn-dismiss { background: none; border: none; font-size: 1.2rem; color: #999; cursor: pointer; }
.btn-dismiss:hover { color: #666; }

/* ── Estados (loading / error / not-implemented) ─────────────── */
.state-block {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6rem; padding: 3rem 1rem; color: #666; text-align: center;
}
.state-block i { font-size: 2rem; color: #aaa; }
.state-block.error i { color: #c0392b; }
.state-block.error p { color: #9b1c1c; }
.state-block.pending i { color: #e67e22; }
.state-block.pending p { color: #444; }
.state-block.pending small { color: #888; font-size: 0.85rem; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner-icon { display: inline-block; animation: spin 0.8s linear infinite; font-size: 2rem; color: #065f8b; }

.btn-modal-confirm:disabled { opacity: 0.55; cursor: not-allowed; }
</style>
