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
          <!-- DateFieldBR em vez de <input type="date">: o campo nativo exibe a
               data no formato do navegador do usuário (mm/dd/aaaa em interface
               inglesa) e a página não pode mudar isso. -->
          <DateFieldBR
            v-model="item.startDate"
            :disabled="isSaving"
            :aria-label="`${item.label} — início`"
            @update:modelValue="validarItem(item)"
          />
          <!-- Etapas de fase única (endKey null) têm só uma data no schema;
               mostrar um segundo campo sugeriria que ele é gravado, e não é. -->
          <template v-if="item.endKey">
            <span class="arrow">➝</span>
            <DateFieldBR
              v-model="item.endDate"
              :disabled="isSaving"
              :aria-label="`${item.label} — fim`"
              @update:modelValue="validarItem(item)"
            />
          </template>
          <span v-else class="single-phase-hint">(data única)</span>
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
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { createSemester } from '@/services/api'
import { useTimelineStore } from '@/stores/timelineData'
import DateFieldBR from '@/components/DateFieldBR.vue'

const timelineStore = useTimelineStore()

// Cada item carrega as chaves do payload que recebem startDate/endDate.
// Etapas com fase única no schema (orientação, homologação, encerramento)
// só consomem startKey; endKey fica null e a data final não é persistida.
//
// A ordem das etapas aqui é a da linha do tempo (STEP_DEFINITIONS em
// stores/timelineData.js), para o painel bater com o que os usuários veem.
const cronogramaItems = ref([
  {
    label: 'Definição de vagas',
    startDate: '', endDate: '', error: '',
    startKey: 'vacancyDefStartDate', endKey: 'vacancyDefEndDate',
  },
  {
    label: 'Cadastro de temas',
    startDate: '', endDate: '', error: '',
    startKey: 'themeRegStartDate', endKey: 'themeRegEndDate',
  },
  {
    label: 'Período de busca e solicitação',
    startDate: '', endDate: '', error: '',
    startKey: 'searchStartDate', endKey: 'searchEndDate',
  },
  {
    label: 'Análise das solicitações',
    startDate: '', endDate: '', error: '',
    startKey: 'analysisStartDate', endKey: 'analysisEndDate',
  },
  {
    label: 'Confirmação do vínculo',
    startDate: '', endDate: '', error: '',
    startKey: 'linkConfirmStartDate', endKey: 'linkConfirmEndDate',
  },
  {
    label: 'Encerramento do período de buscas',
    startDate: '', endDate: '', error: '',
    startKey: 'closureDate', endKey: null,
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
])

const isSaving = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// ISO ("2026-03-01T00:00:00.000Z") → "YYYY-MM-DD" para o <input type="date">.
// UTC, e não hora local, pelo mesmo motivo do store: em UTC-3 o getDate() local
// devolveria o dia anterior.
function isoToInputDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${date.getUTCFullYear()}-${mm}-${dd}`
}

// Preenche o formulário com o cronograma já salvo, para o coordenador ver e
// editar o que está no ar em vez de encarar campos vazios.
function preencherComSemestre(semester) {
  if (!semester) return
  cronogramaItems.value.forEach((item) => {
    item.startDate = isoToInputDate(semester[item.startKey])
    item.endDate = item.endKey ? isoToInputDate(semester[item.endKey]) : ''
    item.error = ''
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    await timelineStore.loadActiveSemester()
    preencherComSemestre(timelineStore.semester)
  } finally {
    isLoading.value = false
  }
})

function clearMessages(delay = 4000) {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, delay)
}

// ── Validação de um item individual ────────────────────────────
const validarItem = (item) => {
  // Etapa de fase única não tem data de fim para comparar.
  if (!item.endKey || !item.startDate || !item.endDate) {
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

  // 1. Todos os campos preenchidos? (fase única exige apenas o início)
  const algumVazio = items.some(i => !i.startDate || (i.endKey && !i.endDate))
  if (algumVazio) {
    Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todas as datas antes de confirmar.' })
    return
  }

  // 2. Alguma data de fim anterior ao início?
  const erroOrdem = items.find(i => i.endKey && i.endDate && i.endDate < i.startDate)
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

    // Recarrega a fonte única da linha do tempo. Sem isto o store continua com
    // o semestre antigo em memória (ele só busca uma vez, no primeiro mount) e
    // os cronogramas do aluno, do docente e da página pública seguiriam
    // mostrando as datas anteriores até o usuário recarregar o navegador.
    await timelineStore.loadActiveSemester()
    preencherComSemestre(timelineStore.semester)

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
.single-phase-hint { color: #777; font-size: 0.8rem; font-style: italic; }
/* A moldura e o ícone dos campos de data agora vivem em DateFieldBR.vue. */
.arrow { color: #666; font-weight: bold; }
.action-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Estados de erro ────────────────────────────────────────── */
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
