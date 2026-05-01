<template>
  <div class="view-calendar">
    <h2 class="view-title">Gerenciamento do Cronograma do Processo de TCC</h2>

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
              @change="validarItem(item)"
            />
            <i class="bi bi-calendar"></i>
          </div>
        </div>
        <!-- Mensagem de erro inline por etapa -->
        <p v-if="item.error" class="error-inline">
          <i class="bi bi-exclamation-circle"></i> {{ item.error }}
        </p>
      </div>
    </div>

    <div class="action-footer">
      <button class="btn-action btn-blue" @click="limparDatas">Limpar</button>
      <button class="btn-action btn-gray" @click="editarDatas">Editar</button>
      <button class="btn-action btn-green" @click="confirmarDatas">Confirmar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const cronogramaItems = ref([
  { label: 'Definição de vagas',              startDate: '', endDate: '', error: '' },
  { label: 'Início das orientações',          startDate: '', endDate: '', error: '' },
  { label: 'Homologação e análise',           startDate: '', endDate: '', error: '' },
  { label: 'Análise das solicitações',        startDate: '', endDate: '', error: '' },
  { label: 'Encerramento do período de buscas', startDate: '', endDate: '', error: '' },
  { label: 'Período de busca e solicitação',  startDate: '', endDate: '', error: '' },
  { label: 'Confirmação do vínculo',          startDate: '', endDate: '', error: '' },
])

// ── Validação de um item individual ────────────────────────────
// Regra: data de fim não pode ser anterior à data de início
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
  Swal.fire({ icon: 'success', title: 'Datas limpas', timer: 1500, showConfirmButton: false })
}

const editarDatas = () => {
  Swal.fire({
    icon: 'info',
    title: 'Modo de edição',
    text: 'Você pode editar as datas diretamente nos campos.',
    confirmButtonColor: '#065f8b'
  })
}

// ── Confirmar com validações completas ─────────────────────────
const confirmarDatas = () => {
  const items = cronogramaItems.value

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
      confirmButtonColor: '#c0392b'
    })
    return
  }

  // 3. Duas etapas com período idêntico (mesma data início E fim)?
  const pares = items.map(i => `${i.startDate}|${i.endDate}`)
  const duplicatas = pares.filter((par, idx) => pares.indexOf(par) !== idx)
  if (duplicatas.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Períodos duplicados',
      text: 'Duas ou mais etapas estão com as datas de início e fim idênticas. Cada etapa deve ter um período único.',
      confirmButtonColor: '#c0392b'
    })
    return
  }

  // 4. Tudo ok!
  Swal.fire({ icon: 'success', title: 'Cronograma Salvo!', confirmButtonColor: '#53b57c' })
}
</script>

<style scoped>
@import './panelStyles.css';

.calendar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 4rem; margin-bottom: 3rem; }
.date-group label { display: block; font-weight: 600; font-style: italic; margin-bottom: 0.5rem; color: #000; }
.date-inputs { display: flex; align-items: center; gap: 1rem; }
.input-wrapper { border: 2px solid #aabcfc; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; width: 180px; color: #666; font-size: 0.9rem; background: #fff; position: relative; }
.date-input { border: none; outline: none; font-family: 'Poppins', sans-serif; font-size: 0.9rem; color: #333; width: 100%; background: transparent; cursor: pointer; }
.date-input::-webkit-calendar-picker-indicator { position: absolute; left: 0; right: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.input-wrapper i { pointer-events: none; color: #aabcfc; }
.arrow { color: #666; font-weight: bold; }
.action-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }

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
</style>
