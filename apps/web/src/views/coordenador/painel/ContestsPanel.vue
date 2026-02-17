<template>
  <div class="view-contests">
    <h2 class="view-title">Vagas contestadas</h2>

    <div class="contests-table-container">
      <div class="contest-header-row">
        <div class="col-docente">Docente</div>
        <div class="col-justificativa">Justificativa</div>
        <div class="col-situacao">Situação</div>
      </div>

      <div class="contest-list">
        <div v-for="contest in contestsList" :key="contest.id" class="contest-row">
          <div class="col-docente">
            <div class="contest-avatar">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="contest-info">
              <span class="contest-name">{{ contest.name }}</span>
              <span class="contest-id">{{ contest.id }}</span>
            </div>
          </div>

          <div class="col-justificativa">
            <div class="reason-box">
              {{ contest.reason }}
            </div>
          </div>

          <div class="col-situacao">
            <div v-if="contest.status === 'pending'" class="contest-actions">
              <button class="btn-contest-action btn-accept" @click="openAcceptContest(contest)">Aceitar</button>
              <button class="btn-contest-action btn-reject" @click="openRejectContest(contest)">Recusar</button>
            </div>

            <div v-else class="contest-status-badge" :class="contest.status">
              <span>{{ contest.status === 'accepted' ? 'Aceita' : 'Recusada' }}</span>
              <button class="btn-dismiss" @click="removeContest(contest.id)"><i class="bi bi-x-square"></i></button>
            </div>
          </div>

        </div>

        <div v-if="contestsList.length === 0" class="empty-list-state">
          <i class="bi bi-inbox"></i>
          <p>Nenhuma contestação pendente.</p>
        </div>
      </div>
    </div>

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
          <button class="btn-modal-confirm" @click="confirmRejectAction">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const contestsList = ref([
  { id: '123456', name: 'Lorem Ipsum Dolor Siamet', reason: 'Necessito de mais 2 vagas pois tenho alunos de IC iniciando.', status: 'pending' },
  { id: '123457', name: 'Lorem Ipsum Dolor Siamet', reason: 'Erro na contagem inicial, preciso de correção.', status: 'pending' },
  { id: '123458', name: 'Lorem Ipsum Dolor Siamet', reason: 'Solicito aumento de cota.', status: 'pending' },
  { id: '123459', name: 'Lorem Ipsum Dolor Siamet', reason: 'Vagas preenchidas, solicito extra.', status: 'accepted' },
  { id: '123460', name: 'Lorem Ipsum Dolor Siamet', reason: 'Sem justificativa plausível.', status: 'rejected' }
])

const showRejectModal = ref(false)
const activeContestItem = ref(null)
const rejectReason = ref('')
const rejectCustomReason = ref('')

const emit = defineEmits(['accepted'])

const openAcceptContest = (contest) => {
  Swal.fire({
    title: 'Solicitação aceita com sucesso!',
    text: 'Você está sendo redirecionado para a página de Definição de vagas para realizar o ajuste.',
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    willClose: () => {
      contest.status = 'accepted'
      emit('accepted', contest)
    }
  })
}

const openRejectContest = (contest) => {
  activeContestItem.value = contest
  rejectReason.value = ''
  rejectCustomReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  activeContestItem.value = null
}

const confirmRejectAction = () => {
  if (activeContestItem.value) {
    activeContestItem.value.status = 'rejected'
    Swal.fire({
      icon: 'info',
      title: 'Contestação Recusada',
      text: 'A justificativa foi enviada ao docente.',
      timer: 1500,
      showConfirmButton: false
    })
  }
  closeRejectModal()
}

const removeContest = (id) => {
  contestsList.value = contestsList.value.filter(c => c.id !== id)
}

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
.btn-accept { background-color: #28a745; }
.btn-reject { background-color: #dc3545; }
.contest-status-badge { display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: space-between; }
.contest-status-badge span { background-color: #a0a0a0; color: white; padding: 6px 20px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; font-style: italic; flex: 1; text-align: center; }
.contest-status-badge.accepted span { background-color: #a0a0a0; }
.contest-status-badge.rejected span { background-color: #a0a0a0; }
.btn-dismiss { background: none; border: none; font-size: 1.2rem; color: #999; cursor: pointer; }
.btn-dismiss:hover { color: #666; }
</style>
