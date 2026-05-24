<template>
  <div class="view-vacancies">
    <h2 class="view-title">Definição de vagas</h2>

    <!-- Alertas de feedback — aparecem apenas quando há mensagem -->
    <div v-if="successMessage" class="alert-feedback alert-success">
      <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert-feedback alert-error">
      <i class="bi bi-x-circle-fill"></i> {{ errorMessage }}
    </div>

    <div class="vacancies-board">
      <div class="section-global">
        <h3 class="section-subtitle">Configuração Global</h3>
        <div class="controls-row-global">
          <div class="control-group">
            <label>Quantidade padrão de vagas</label>
            <div class="modern-stepper">
              <button class="stepper-btn minus" :disabled="isLoadingGlobal" @click="globalCount > 0 ? globalCount-- : 0">
                <i class="bi bi-dash-lg"></i>
              </button>
              <input type="number" v-model="globalCount" readonly class="stepper-input">
              <button class="stepper-btn plus" :disabled="isLoadingGlobal" @click="globalCount++">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <label class="checkbox-container">
            <input type="checkbox" v-model="applyAll" :disabled="isLoadingGlobal">
            <span class="checkmark"></span>
            <span class="label-text">Aplicar esta quantidade para <strong>todos</strong> os docentes inicialmente</span>
          </label>
        </div>

        <div class="action-row right mt-3">
          <button class="btn-confirm" @click="saveGlobal" :disabled="isLoadingGlobal">
            <span v-if="isLoadingGlobal">
              <i class="bi bi-arrow-repeat spinner-icon"></i> Salvando...
            </span>
            <span v-else>
              <i class="bi bi-check2-circle"></i> Aplicar Globalmente
            </span>
          </button>
        </div>
      </div>

      <div class="section-divider"></div>

      <div class="section-specific">
        <div class="specific-layout">
          <div class="specific-left">
            <h3 class="section-subtitle mb-4">Ajuste Específico por Docente</h3>

            <div class="form-group mb-4">
              <label class="field-label">Buscar docente</label>
              <div class="modern-search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" placeholder="Digite o nome ou ID..." v-model="searchQuery">
                <button class="btn-search-action" title="Adicionar à lista">
                  <i class="bi bi-arrow-right-short"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="field-label">Quantidade de vagas para os selecionados</label>
              <div class="modern-stepper mr-auto">
                <button class="stepper-btn minus" :disabled="isLoadingSpecific" @click="specificCount > 0 ? specificCount-- : 0">
                  <i class="bi bi-dash-lg"></i>
                </button>
                <input type="number" v-model="specificCount" readonly class="stepper-input">
                <button class="stepper-btn plus" :disabled="isLoadingSpecific" @click="specificCount++">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="specific-right">
            <div class="list-header">
              <span class="list-title">Docentes Selecionados ({{ selectedProfessors.length }})</span>
              <button class="btn-clear-all" v-if="selectedProfessors.length > 0" :disabled="isLoadingSpecific" @click="clearAll">Limpar tudo</button>
            </div>

            <div class="selected-professors-list custom-scrollbar">
              <div v-for="prof in selectedProfessors" :key="prof.id" class="prof-card-item">
                <div class="prof-avatar-container">
                  <i class="bi bi-person-circle prof-avatar-icon"></i>
                </div>

                <div class="prof-info">
                  <span class="prof-name">{{ prof.name }}</span>
                  <span class="prof-details">{{ prof.area }} • ID: {{ prof.id }}</span>
                </div>

                <button class="btn-remove-card" :disabled="isLoadingSpecific" @click="removeProf(prof.id)" title="Remover da lista">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <div v-if="selectedProfessors.length === 0" class="empty-list-state">
                <i class="bi bi-people"></i>
                <p>Nenhum docente selecionado.</p>
              </div>
            </div>

            <div class="action-row right mt-3">
              <button
                class="btn-confirm btn-confirm-specific"
                :disabled="selectedProfessors.length === 0 || isLoadingSpecific"
                @click="saveSpecific"
              >
                <span v-if="isLoadingSpecific">
                  <i class="bi bi-arrow-repeat spinner-icon"></i> Salvando...
                </span>
                <span v-else>
                  Atualizar Selecionados
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineVacancies, getTeachers } from '@/services/api'

const props = defineProps({
  selectedProfessors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedProfessors'])

const globalCount = ref(5)
const applyAll = ref(true)
const specificCount = ref(3)
const searchQuery = ref('')

// ── Estados de feedback ────────────────────────────────────────
const isLoadingGlobal = ref(false)
const isLoadingSpecific = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function clearMessages(delay = 4000) {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, delay)
}

function resetMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function extractApiError(err) {
  const apiMsg = err?.response?.data?.message
  if (Array.isArray(apiMsg)) return apiMsg.join('; ')
  return apiMsg || err?.message || 'Falha na comunicação com o servidor.'
}

function validateQuantity(qty) {
  const n = Number(qty)
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, value: 0, error: 'Quantidade inválida. Use um número inteiro maior ou igual a 0.' }
  }
  return { ok: true, value: n, error: null }
}

// Dispara POST /vacancies/define em paralelo para uma lista de docentes
// e devolve um resumo agregado (ok, falhas, mensagens) sem propagar exceção.
async function applyVacanciesBatch(teacherIds, quantity) {
  const results = await Promise.allSettled(
    teacherIds.map(id => defineVacancies({ teacherId: id, quantity })),
  )

  const ok = []
  const fail = []
  results.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      ok.push(teacherIds[idx])
    } else {
      fail.push({ teacherId: teacherIds[idx], reason: extractApiError(r.reason) })
    }
  })
  return { ok, fail, total: teacherIds.length }
}

// ── Ações da lista ─────────────────────────────────────────────
const removeProf = (id) => {
  emit('update:selectedProfessors', props.selectedProfessors.filter(p => p.id !== id))
}

const clearAll = () => {
  emit('update:selectedProfessors', [])
}

// ── Salvar global ──────────────────────────────────────────────
const saveGlobal = async () => {
  if (isLoadingGlobal.value) return
  resetMessages()

  const v = validateQuantity(globalCount.value)
  if (!v.ok) {
    errorMessage.value = v.error
    clearMessages()
    return
  }

  isLoadingGlobal.value = true
  try {
    const teachers = await getTeachers()
    const teacherIds = (Array.isArray(teachers) ? teachers : [])
      .map(t => Number(t?.id))
      .filter(id => Number.isInteger(id) && id > 0)

    if (teacherIds.length === 0) {
      errorMessage.value = 'Nenhum docente encontrado para aplicar a quantidade global.'
      clearMessages()
      return
    }

    const { ok, fail, total } = await applyVacanciesBatch(teacherIds, v.value)

    if (fail.length === 0) {
      successMessage.value = `✓ ${ok.length} docente(s) atualizado(s) com ${v.value} vaga(s).`
    } else if (ok.length === 0) {
      errorMessage.value = `Falha ao definir vagas globais (${fail.length}/${total}). ${fail[0].reason}`
    } else {
      successMessage.value = `Atualização parcial: ${ok.length}/${total} docente(s) com sucesso.`
      errorMessage.value = `${fail.length} falha(s). Ex.: ${fail[0].reason}`
    }
  } catch (err) {
    errorMessage.value = extractApiError(err)
  } finally {
    isLoadingGlobal.value = false
    clearMessages()
  }
}

// ── Salvar específico ──────────────────────────────────────────
const saveSpecific = async () => {
  if (isLoadingSpecific.value) return
  if (props.selectedProfessors.length === 0) return
  resetMessages()

  const v = validateQuantity(specificCount.value)
  if (!v.ok) {
    errorMessage.value = v.error
    clearMessages()
    return
  }

  const teacherIds = props.selectedProfessors
    .map(p => Number(p?.id))
    .filter(id => Number.isInteger(id) && id > 0)

  if (teacherIds.length === 0) {
    errorMessage.value = 'Nenhum docente válido na lista (IDs inválidos).'
    clearMessages()
    return
  }

  isLoadingSpecific.value = true
  try {
    const { ok, fail, total } = await applyVacanciesBatch(teacherIds, v.value)

    if (fail.length === 0) {
      successMessage.value = `✓ ${ok.length} docente(s) atualizado(s) com ${v.value} vaga(s).`
    } else if (ok.length === 0) {
      errorMessage.value = `Falha ao atualizar selecionados (${fail.length}/${total}). ${fail[0].reason}`
    } else {
      successMessage.value = `Atualização parcial: ${ok.length}/${total} docente(s) com sucesso.`
      errorMessage.value = `${fail.length} falha(s). Ex.: ${fail[0].reason}`
    }
  } catch (err) {
    errorMessage.value = extractApiError(err)
  } finally {
    isLoadingSpecific.value = false
    clearMessages()
  }
}
</script>

<style scoped>
@import './panelStyles.css';

.controls-row-global { display: flex; align-items: center; gap: 3rem; background-color: #f8f9fa; padding: 1.5rem 2rem; border-radius: 10px; border: 1px solid #eef0f2; }
.control-group label { display: block; font-weight: 500; color: #555; margin-bottom: 0.8rem; font-size: 0.95rem; }
.specific-layout { display: flex; gap: 4rem; }
.specific-left { flex: 1; }
.specific-right { flex: 1.2; display: flex; flex-direction: column; }
.selected-professors-list { display: flex; flex-direction: column; gap: 0.8rem; max-height: 350px; overflow-y: auto; padding-right: 5px; }

/* ── Alertas de feedback ───────────────────────────────────── */
.alert-feedback {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
}
.alert-success {
  background-color: #d1f5e0;
  color: #1a7a45;
  border: 1px solid #a3e6c0;
}
.alert-error {
  background-color: #fde8e8;
  color: #9b1c1c;
  border: 1px solid #f8b4b4;
}

/* ── Spinner no botão ─────────────────────────────────────── */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spinner-icon {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

.btn-confirm:disabled,
.stepper-btn:disabled,
.btn-clear-all:disabled,
.btn-remove-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
