<template>
  <div class="view-calendar">
    <h2 class="view-title">Gerenciamento do Cronograma do Processo de TCC</h2>

    <!-- Alertas de feedback inline -->
    <div v-if="successMessage" class="alert-feedback alert-success">
      <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert-feedback alert-error">
      <i class="bi bi-x-circle-fill"></i> {{ errorMessage }}
    </div>

    <div class="calendar-grid">
      <div
        v-for="item in cronogramaItems"
        :key="item.label"
        class="date-group"
        :class="{ 'has-error': item.error }"
      >
        <label>{{ item.label }}</label>
        <div class="date-inputs">
          <div class="input-wrapper" :class="{ 'input-error': item.error }">
            <input
              type="date"
              v-model="item.startDate"
              class="date-input"
              :disabled="isSaving"
              @change="validarItem(item)"
            />
            <i class="bi bi-calendar"></i>
          </div>
          <span class="arrow">➝</span>
          <div class="input-wrapper" :class="{ 'input-error': item.error }">
            <input
              type="date"
              v-model="item.endDate"
              class="date-input"
              :disabled="isSaving"
              @change="validarItem(item)"
            />
            <i class="bi bi-calendar"></i>
          </div>
        </div>
        <p v-if="item.error" class="error-inline">
          <i class="bi bi-exclamation-circle"></i> {{ item.error }}
        </p>
      </div>
    </div>

    <div class="action-footer">
      <button class="btn-action btn-blue" :disabled="isSaving" @click="limparDatas">Limpar</button>
      <button class="btn-action btn-gray" :disabled="isSaving" @click="editarDatas">Editar</button>
      <button class="btn-action btn-green" :disabled="isSaving" @click="confirmarDatas">
        <span v-if="isSaving"><i class="bi bi-arrow-repeat spinner-icon"></i> Salvando...</span>
        <span v-else>Confirmar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { createSemester } from '@/services/api'

// Cada item carrega as chaves do payload que recebem startDate/endDate.
// Etapas com fase única no schema (orientação, homologação, encerramento)
// só consomem startKey; endKey fica null e a data final não é persistida.
const cronogramaItems = ref([
  {
    label: 'Definição de vagas',
    startDate: '', endDate: '', error: '',
    startKey: 'vacancyDefStartDate', endKey: 'vacancyDefEndDate',
  },
  {
    label: 'Início das orientações',
    startDate: '', endDate: '', error: '',
    startKey: 'orientationStartDate', endKey: null,
  },
  {
    label: 'Homologação e análise',
    startDate: '', endDate: '', error: '',
    startKey: 'homologationDate', endKey: null,
  },
  {
    label: 'Análise das solicitações',
    startDate: '', endDate: '', error: '',
    startKey: 'analysisStartDate', endKey: 'analysisEndDate',
  },
  {
    label: 'Encerramento do período de buscas',
    startDate: '', endDate: '', error: '',
    startKey: 'closureDate', endKey: null,
  },
  {
    label: 'Período de busca e solicitação',
    startDate: '', endDate: '', error: '',
    startKey: 'searchStartDate', endKey: 'searchEndDate',
  },
  {
    label: 'Confirmação do vínculo',
    startDate: '', endDate: '', error: '',
    startKey: 'linkConfirmStartDate', endKey: 'linkConfirmEndDate',
  },
])

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function clearMessages(delay = 4000) {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, delay)
}

// ── Validação de um item individual ────────────────────────────
const validarItem = (item) => {
  if (!item.startDate || !item.endDate) {
    item.error = ''
    return
  }
  if (item.endDate < item.startDate) {
    item.error = 'A data de fim não pode ser anterior à data de início.'
  } else {
    item.error = ''
  }
}

// ── Limpar ─────────────────────────────────────────────────────
const limparDatas = () => {
  cronogramaItems.value.forEach(item => {
    item.startDate = ''
    item.endDate = ''
    item.error = ''
  })
  successMessage.value = ''
  errorMessage.value = ''
  Swal.fire({ icon: 'success', title: 'Datas limpas', timer: 1500, showConfirmButton: false })
}

const editarDatas = () => {
  Swal.fire({
    icon: 'info',
    title: 'Modo de edição',
    text: 'Você pode editar as datas diretamente nos campos.',
    confirmButtonColor: '#065f8b',
  })
}

// "YYYY-MM-DD" → ISO 8601 (UTC). Para datas de fim, fixa final do dia.
function toIso(dateStr, isEnd = false) {
  if (!dateStr) return undefined
  return isEnd
    ? `${dateStr}T23:59:59.999Z`
    : `${dateStr}T00:00:00.000Z`
}

// Deriva ano/período a partir da menor data de início informada
function derivePeriod(items) {
  const earliest = items
    .map(i => i.startDate)
    .filter(Boolean)
    .sort()[0]
  const ref = earliest ? new Date(earliest) : new Date()
  const year = ref.getUTCFullYear()
  const period = ref.getUTCMonth() + 1 <= 6 ? '1' : '2'
  return { year, period }
}

function buildPayload(items) {
  const { year, period } = derivePeriod(items)
  const payload = { year, period, isActive: true }

  for (const item of items) {
    if (item.startKey && item.startDate) {
      payload[item.startKey] = toIso(item.startDate, false)
    }
    if (item.endKey && item.endDate) {
      payload[item.endKey] = toIso(item.endDate, true)
    }
  }
  return payload
}

// ── Confirmar com validações + persistência ────────────────────
const confirmarDatas = async () => {
  if (isSaving.value) return

  const items = cronogramaItems.value
  successMessage.value = ''
  errorMessage.value = ''

  // 1. Todos os campos preenchidos?
  const algumVazio = items.some(i => !i.startDate || !i.endDate)
  if (algumVazio) {
    Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todas as datas antes de confirmar.' })
    return
  }

  // 2. Alguma data de fim anterior ao início?
  const erroOrdem = items.find(i => i.endDate < i.startDate)
  if (erroOrdem) {
    Swal.fire({
      icon: 'error',
      title: 'Data inválida',
      text: `A etapa "${erroOrdem.label}" tem a data de fim antes da data de início.`,
      confirmButtonColor: '#c0392b',
    })
    return
  }

  // 3. Duas etapas com período idêntico?
  const pares = items.map(i => `${i.startDate}|${i.endDate}`)
  const duplicatas = pares.filter((par, idx) => pares.indexOf(par) !== idx)
  if (duplicatas.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Períodos duplicados',
      text: 'Duas ou mais etapas estão com as datas de início e fim idênticas. Cada etapa deve ter um período único.',
      confirmButtonColor: '#c0392b',
    })
    return
  }

  // 4. Monta payload e persiste
  const payload = buildPayload(items)

  isSaving.value = true
  try {
    await createSemester(payload)
    successMessage.value = 'Cronograma salvo com sucesso!'
    Swal.fire({
      icon: 'success',
      title: 'Cronograma Salvo!',
      text: `Semestre ${payload.year}/${payload.period} criado.`,
      confirmButtonColor: '#53b57c',
    })
    clearMessages()
  } catch (err) {
    const apiMsg = err?.response?.data?.message
    const detail = Array.isArray(apiMsg) ? apiMsg.join('; ') : (apiMsg || err?.message || 'Falha ao salvar cronograma.')
    errorMessage.value = detail
    Swal.fire({
      icon: 'error',
      title: 'Erro ao salvar',
      text: detail,
      confirmButtonColor: '#c0392b',
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
@import './panelStyles.css';

.calendar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 4rem; margin-bottom: 3rem; }
.date-group label { display: block; font-weight: 600; font-style: italic; margin-bottom: 0.5rem; color: #000; }
.date-inputs { display: flex; align-items: center; gap: 1rem; }
.input-wrapper { border: 2px solid #aabcfc; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; width: 180px; color: #666; font-size: 0.9rem; background: #fff; position: relative; }
.date-input { border: none; outline: none; font-family: 'Poppins', sans-serif; font-size: 0.9rem; color: #333; width: 100%; background: transparent; cursor: pointer; }
.date-input:disabled { cursor: not-allowed; opacity: 0.6; }
.date-input::-webkit-calendar-picker-indicator { position: absolute; left: 0; right: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.input-wrapper i { pointer-events: none; color: #aabcfc; }
.arrow { color: #666; font-weight: bold; }
.action-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Estados de erro ────────────────────────────────────────── */
.input-error { border-color: #e74c3c; }
.input-error i { color: #e74c3c; }
.error-inline {
  color: #c0392b;
  font-size: 0.78rem;
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── Alertas de feedback ────────────────────────────────────── */
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

/* ── Spinner ─────────────────────────────────────────────────── */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spinner-icon {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}
</style>
