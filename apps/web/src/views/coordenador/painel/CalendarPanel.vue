<template>
  <div class="view-calendar">
    <h2 class="view-title">Gerenciamento do Cronograma do Processo de TCC</h2>

    <div class="calendar-grid">
      <div class="date-group" v-for="item in cronogramaItems" :key="item.label">
        <label>{{ item.label }}</label>
        <div class="date-inputs">
          <div class="input-wrapper">
            <input type="date" v-model="item.startDate" class="date-input" />
            <i class="bi bi-calendar"></i>
          </div>
          <span class="arrow">➝</span>
          <div class="input-wrapper">
            <input type="date" v-model="item.endDate" class="date-input" />
            <i class="bi bi-calendar"></i>
          </div>
        </div>
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
  { label: 'Definição de vagas', startDate: '', endDate: '' },
  { label: 'Início das orientações', startDate: '', endDate: '' },
  { label: 'Homologação e análise', startDate: '', endDate: '' },
  { label: 'Análise das solicitações', startDate: '', endDate: '' },
  { label: 'Encerramento do período de buscas', startDate: '', endDate: '' },
  { label: 'Período de busca e solicitação', startDate: '', endDate: '' },
  { label: 'Confirmação do vínculo', startDate: '', endDate: '' }
])

const limparDatas = () => {
  cronogramaItems.value.forEach(item => {
    item.startDate = ''
    item.endDate = ''
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

const confirmarDatas = () => {
  const algumVazio = cronogramaItems.value.some(i => !i.startDate || !i.endDate)
  if (algumVazio) {
    Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todas as datas antes de confirmar.' })
    return
  }
  Swal.fire({ icon: 'success', title: 'Cronograma Salvo', confirmButtonColor: '#53b57c' })
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
</style>
