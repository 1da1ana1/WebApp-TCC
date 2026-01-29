<template>
  <CronogramSchedule/>
  <div class="page-wrapper">
    <div class="main-layout">
      
      <aside class="teacher-sidebar">
        <div class="profile-card">
          <div class="sidebar-header">
            <div class="avatar-circle">
              <img :src="teacher.photo || '/src/assets/img/default-avatar.png'" alt="Perfil" />
            </div>

            <div class="teacher-identity">
              <h2 class="teacher-name">{{ teacher.name }}</h2>
              <p class="teacher-id">ID: {{ teacher.id }}</p>
            </div>
          </div>

          <div class="sidebar-menu">
            <nav class="sidebar-nav">
              <ul>
                <li>
                  <button class="btn-menu" :class="{ 'active-btn': currentView === 'home' }" @click="currentView = 'home'">
                    Início <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li>
                  <button class="btn-menu" :class="{ 'active-btn': currentView === 'requests' }" @click="currentView = 'requests'">
                    Minhas solicitações <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li>
                  <button class="btn-menu" :class="{ 'active-btn': currentView === 'history' }" @click="currentView = 'history'">
                    Histórico de solicitações <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li>
                  <button class="btn-menu" :class="{ 'active-btn': currentView === 'guidances' }" @click="currentView = 'guidances'">
                    Orientações em vigência <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li>
                  <button class="btn-menu" :class="{ 'active-btn': currentView === 'stats' }" @click="currentView = 'stats'">
                    Estatísticas Pessoais <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <main class="content-panel">
        
        <div v-if="currentView === 'home'">
          <section class="card-section tags-input-area">
            <h3>Cadastrar temas:</h3>
            <p class="instruction italic">Insira palavras-chave aqui:</p>
            <div class="tags-control-container">
              <div class="input-wrapper">
                <input type="text" v-model="newTag" @keyup.enter="addTag" placeholder="Ex: Inteligência Artificial" />
                <button type="button" class="add-tag-btn" @click="addTag"><i class="bi bi-plus-lg"></i></button>
              </div>
              <div class="tags-display">
                <span v-for="(tag, index) in tags" :key="index" class="tag" :class="getTagColor(index)">
                  {{ tag }} <i class="bi bi-x" @click="removeTag(index)"></i>
                </span>
              </div>
            </div>
          </section>

          <section class="card-section vacancies-area">
            <h3>Relação de vagas:</h3>
            <div class="vacancies-layout">
              <div class="vacancies-status">
                <div class="vacancy-box green"><span>VAGAS DEFINIDAS PELA COORDENAÇÃO: {{ vacancies.total }}</span></div>
                <div class="vacancy-box yellow"><span>VAGAS RESTANTES: {{ vacancies.total - vacancies.filled }}</span></div>
                <div class="vacancy-box red"><span>VAGAS PREENCHIDAS: {{ vacancies.filled }}</span></div>
              </div>
              <div class="contest-card">
                <button class="btn-contest" @click="openContestModal">Contestar vagas</button>
                <p class="contest-dates">Período de contestação:<br>01/01/2025 - 15/01/2025</p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'requests'">
          <section class="card-section">
            <h3 class="mb-4">Minhas solicitações</h3>
            
            <div class="requests-list">
              <div v-for="req in requestsList" :key="req.id" class="request-item">
                
                <div class="request-info">
                  <div class="avatar-placeholder">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div class="student-details">
                    <span class="student-name">{{ req.name }}</span>
                    <span class="student-ra">{{ req.ra }}</span>
                  </div>
                </div>

                <div class="request-actions">
                  <button class="btn-action btn-accept" @click="handleAccept(req)">Aceitar</button>
                  <button class="btn-action btn-reject" @click="openRejectModal(req)">Recusar</button>
                </div>

              </div>
              
              <div v-if="requestsList.length === 0" class="empty-state">
                <p>Não há solicitações pendentes.</p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'history'">
           <RequestHistoryTable title="Histórico de solicitações" :data="historyData" />
        </div>

        <div v-else-if="currentView === 'guidances'">
          <section class="card-section">
            <h3>Alunos em orientação:</h3>
            <p class="instruction">Semestre 1/2025</p>

            <div v-if="guidancesList.length === 0" class="empty-state">Nenhuma orientação em vigência.</div>

            <div class="guidance-list">
              <div v-for="g in guidancesList" :key="g.id" class="guidance-item">
                <div class="guidance-main">
                  <div class="avatar-placeholder small"><i class="bi bi-person-fill"></i></div>
                  <div class="guidance-info">
                    <div class="student-name">{{ g.studentName }}</div>
                    <div class="project-title">{{ g.projectTitle }}</div>
                    <div class="meta">Iniciado em: {{ g.startDate }}</div>
                  </div>
                </div>

                <div class="guidance-controls">
                  <span class="status-badge" :class="g.status">{{ statusLabel(g.status) }}</span>

                  <div class="controls">
                    <button v-if="g.status !== 'em_vigencia'" class="btn-action btn-accept" @click="markAsInProgress(g.id)">Marcar como em vigência</button>
                    <button v-if="g.status === 'em_vigencia'" class="btn-action btn-accept" @click="finalizeOrientation(g.id)">Marcar como finalizada</button>
                    <button v-if="g.status !== 'cancelada'" class="btn-action btn-reject" @click="cancelOrientation(g.id)">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'stats'">
          <section class="card-section stats-area">
            <h3>Estatísticas Gerais</h3>
            <div class="stats-grid">
              <div class="stat-card"><h4>Total de Solicitações Recebidas:</h4><div class="stat-number">12</div></div>
              <div class="stat-card"><h4>Total de Solicitações Recusadas:</h4><div class="stat-number">8</div></div>
              <div class="stat-card"><h4>Total de Orientações Concluídas:</h4><div class="stat-number">4</div></div>
              <div class="stat-card"><h4>Taxa de aceite</h4><div class="stat-number">80%</div></div>
            </div>
          </section>
        </div>

      </main>
    </div>

    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-card">
        <h3>Por favor, insira a justificativa da recusa:</h3>
        
        <div class="modal-form">
          <label>Selecione um motivo:</label>
          <select v-model="selectedReason" class="modal-select">
            <option value="" disabled selected>Please select</option>
            <option value="Sem vagas disponíveis">Sem vagas disponíveis</option>
            <option value="Tema não compatível">Tema não compatível</option>
            <option value="Falta de disponibilidade">Falta de disponibilidade</option>
            <option value="Outro">Outro motivo não listado</option>
          </select>

          <div v-if="selectedReason === 'Outro'" class="textarea-container">
            <label>Outro motivo não listado:</label>
            <textarea 
              v-model="customJustification" 
              placeholder="Digite a justificativa..." 
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="closeRejectModal">Cancelar</button>
          <button class="btn-modal-confirm" @click="confirmReject">Enviar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import CronogramSchedule from '@/components/CronogramSchedule.vue'
import RequestHistoryTable from '@/components/RequestHistoryTable.vue'
import Swal from 'sweetalert2'
import { useNotificationStore } from '@/stores/notificationStore'

// --- ESTADO DA VIEW ---
const currentView = ref('requests')

const notify = useNotificationStore()

// --- DADOS DO DOCENTE ---
const teacher = ref({
  name: 'Prof. Dr. Lorem Ipsum',
  id: '123456',
  photo: '/src/assets/img/foto-perfil.svg',
})

// --- VAGAS ---
const vacancies = ref({ total: 5, filled: 0 })

// --- TAGS ---
const newTag = ref('')
const tags = ref(['Machine Learning', 'Vue.js']) 

const addTag = () => {
  if (newTag.value.trim() !== '') {
    tags.value.push(newTag.value.trim())
    newTag.value = ''
  }
}
const removeTag = (index) => tags.value.splice(index, 1)
const getTagColor = (index) => ['purple', 'yellow', 'blue'][index % 3]

// --- DADOS DAS SOLICITAÇÕES ---
const requestsList = ref([
  { id: 1, name: 'Lorem Ipsum Dolor Siamet', ra: '123456' },
  { id: 2, name: 'João Silva', ra: '123457' },
  { id: 3, name: 'Maria Souza', ra: '123458' },
  { id: 4, name: 'Pedro Alvares', ra: '123459' },
  { id: 5, name: 'Ana Costa', ra: '123460' },
])

// --- ORIENTAÇÕES (GUIDANCES) ---
const guidancesList = ref([
  { id: 1, studentName: 'João da Silva', projectTitle: 'TCC 1', status: 'em_vigencia', startDate: '01/02/2025' },
  { id: 2, studentName: 'Mariana Costa', projectTitle: 'TCC 2', status: 'finalizada', startDate: '01/01/2024', endDate: '30/09/2024' },
])

const statusLabel = (s) => {
  if (s === 'em_vigencia') return 'Em vigência'
  if (s === 'finalizada') return 'Finalizada'
  if (s === 'cancelada') return 'Cancelada'
  return s
}

const findGuidanceIndex = (id) => guidancesList.value.findIndex(g => g.id === id)

const markAsInProgress = (id) => {
  const idx = findGuidanceIndex(id)
  if (idx === -1) return
  guidancesList.value[idx].status = 'em_vigencia'
  guidancesList.value[idx].startDate = new Date().toLocaleDateString('pt-BR')
  notify.success('Orientação marcada como em vigência.')
}

const finalizeOrientation = async (id) => {
  const idx = findGuidanceIndex(id)
  if (idx === -1) return

  const result = await Swal.fire({
    title: 'Confirmar finalização',
    text: 'Deseja marcar esta orientação como finalizada? Essa ação registrará a data de conclusão.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, finalizar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    guidancesList.value[idx].status = 'finalizada'
    guidancesList.value[idx].endDate = new Date().toLocaleDateString('pt-BR')

    // Add to history for record
    historyData.value.unshift({
      id: guidancesList.value[idx].id,
      name: guidancesList.value[idx].studentName,
      ra: '',
      status: 'Finalizada',
      date: guidancesList.value[idx].endDate
    })

    notify.success('Orientação finalizada com sucesso.')
  }
}

const cancelOrientation = async (id) => {
  const idx = findGuidanceIndex(id)
  if (idx === -1) return

  const result = await Swal.fire({
    title: 'Confirmar cancelamento',
    text: 'Deseja cancelar esta orientação? Esta ação será registrada no histórico.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, cancelar',
    cancelButtonText: 'Voltar'
  })

  if (result.isConfirmed) {
    guidancesList.value[idx].status = 'cancelada'
    guidancesList.value[idx].endDate = new Date().toLocaleDateString('pt-BR')

    historyData.value.unshift({
      id: guidancesList.value[idx].id,
      name: guidancesList.value[idx].studentName,
      ra: '',
      status: 'Cancelada',
      date: guidancesList.value[idx].endDate,
      justification: 'Cancelada pelo docente'
    })

    notify.info('Orientação cancelada.')
  }
}

// --- HISTÓRICO ---
const historyData = ref([
  { id: 99, name: 'Aluno Exemplo', ra: '123123', status: 'Aceita', date: '10/02/2025' }
])

// --- VARIÁVEIS DO MODAL DE RECUSA ---
const showRejectModal = ref(false)
const requestToReject = ref(null)
const selectedReason = ref('')
const customJustification = ref('')

// --- LÓGICA DE ACEITE ---
const handleAccept = (req) => {
  Swal.fire({
    title: 'Deseja confirmar vínculo com o aluno?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Prosseguir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. Remove da lista de solicitações
      requestsList.value = requestsList.value.filter(r => r.id !== req.id)
      
      // 2. Adiciona ao histórico
      historyData.value.unshift({
        id: req.id,
        name: req.name,
        ra: req.ra,
        status: 'Aceita',
        date: new Date().toLocaleDateString('pt-BR')
      })

      // 3. Feedback Sucesso (snackbar)
      notify.success('Solicitação aceita com sucesso.', 3000)
    }
  })
}

// --- LÓGICA DE RECUSA ---
const openRejectModal = (req) => {
  requestToReject.value = req
  selectedReason.value = ''
  customJustification.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  requestToReject.value = null
}

const confirmReject = () => {
  // Validação simples
  if (!selectedReason.value) {
    Swal.fire('Erro', 'Por favor, selecione um motivo.', 'error')
    return
  }
  
  if (selectedReason.value === 'Outro' && !customJustification.value.trim()) {
    Swal.fire('Erro', 'Por favor, escreva a justificativa.', 'error')
    return
  }

  // Define a justificativa final
  const finalJustification = selectedReason.value === 'Outro' ? customJustification.value : selectedReason.value

  // 1. Remove da lista de solicitações
  const req = requestToReject.value
  requestsList.value = requestsList.value.filter(r => r.id !== req.id)

  // 2. Adiciona ao histórico com status Recusada
  historyData.value.unshift({
    id: req.id,
    name: req.name,
    ra: req.ra,
    status: 'Recusada',
    justification: finalJustification,
    date: new Date().toLocaleDateString('pt-BR')
  })

  // 3. Fecha modal e Feedback (snackbar)
  closeRejectModal()
  notify.info('Solicitação recusada. A justificativa foi enviada ao aluno.', 3000)
}

// --- OUTROS ---
const openContestModal = () => {
  Swal.fire({
    title: 'Contestar Vagas',
    input: 'textarea',
    inputLabel: 'Justificativa',
    inputPlaceholder: 'Digite o motivo da contestação...',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    confirmButtonColor: 'var(--color-brand-primary)'
  })
}
</script>

<style scoped>
/* --- LAYOUT GLOBAL --- */
.page-wrapper {
  background-color: #e0e0e0;
  min-height: 100vh;
}

.main-layout {
  background-color: #fff;
  display: flex;
  max-width: 1200px;
  margin: 1.7rem auto;
  padding: 1.2rem;
  gap: 1.3rem;
}

/* --- SIDEBAR --- */
.teacher-sidebar { width: 300px; flex-shrink: 0; }
.profile-card { background: white; border: 1px solid #ccc; }
.sidebar-header { display: flex; align-items: center; padding: 1rem; gap: 1rem; }
.avatar-circle img { width: 100px; height: 100px; border-radius: 50%; border: 2px solid #333; background-color: #000; }
.teacher-name { font-size: 1rem; font-weight: 400; margin: 0; }
.teacher-id { font-size: 0.89rem; font-weight: 800; }

.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.btn-menu {
  width: 100%; background-color: #005b8e; color: white; border: none; padding: 12px 20px;
  display: flex; justify-content: space-between; align-items: center; cursor: pointer;
  font-style: italic; font-size: 0.85rem; height: 60px;
  border-bottom: 1px solid rgba(255,255,255,0.1); transition: filter 0.3s ease; font-family: poppins;
}
.btn-menu:hover { filter: brightness(1.2); }
.btn-menu.active-btn { background-color: #004b75; font-weight: bold; }

/* --- ÁREA DE CONTEÚDO --- */
.content-panel { flex: 1; }
.card-section { background: white; border: 1px solid #ccc; padding: 2rem; margin-bottom: 1.5rem; }
.card-section h3 { margin-top: 0; font-weight: 400; font-size: 1.5rem; margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }

/* --- ESTILOS DA LISTA DE SOLICITAÇÕES (MANTIDO INTACTO) --- */
.requests-list {
  display: flex;
  flex-direction: column;
  margin: 0 -2rem -2rem -2rem; /* Anula padding lateral do card-section */
  max-height: 450px;
  overflow-y: auto; /* Barra de rolagem vertical */
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #dcdcdc; 
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #a0a0a0;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  background-color: #1e1e1e; /* Preto/Cinza escuro */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #000;
}

.student-ra {
  font-size: 0.85rem;
  color: #333;
}

/* Ações (Botões) */
.request-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #a0a0a0; /* Divisor vertical */
  height: 40px; /* Altura para o divisor aparecer bem */
}

.btn-action {
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  font-family: 'Poppins', sans-serif;
  transition: opacity 0.2s;
}

.btn-action:hover { opacity: 0.9; }

.btn-accept {
  background-color: #28a745; /* Verde */
}

.btn-reject {
  background-color: #dc3545; /* Vermelho */
}

/* --- OUTROS ESTILOS --- */
.vacancies-layout { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
.vacancies-status { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.vacancy-box {
  border-radius: 20px; padding: 12px 20px; font-weight: bold; font-style: italic;
  font-size: 0.85rem; text-transform: uppercase; border: 1px solid #333;
  display: flex; align-items: center; color: #000;
}
.vacancy-box.green { background-color: #96f2b3; }
.vacancy-box.yellow { background-color: #fff9c4; }
.vacancy-box.red { background-color: #ffcccb; }

.contest-card {
  border: 1px solid #000; padding: 1.5rem; text-align: center; width: 250px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
}
.btn-contest {
  background-color: #ffcc00; border: none; padding: 10px 20px; font-weight: bold;
  font-style: italic; font-family: poppins; font-size: 1rem; border-radius: 5px; cursor: pointer; width: 100%;
}
.contest-dates { font-size: 0.8rem; font-style: italic; font-weight: bold; margin: 0; }

.tags-control-container { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.input-wrapper { display: flex; border: 1px solid #999; border-radius: 4px; padding: 5px; width: 100%; max-width: 300px; }
.input-wrapper input { border: none; outline: none; flex: 1; padding: 5px; font-style: italic; font-family:poppins; }
.add-tag-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.tags-display { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { padding: 5px 15px; border-radius: 15px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag.purple { background-color: #d8b4fe; color: #4c1d95; }
.tag.yellow { background-color: #fef08a; color: #854d0e; }
.tag.blue { background-color: #93c5fd; color: #1e3a8a; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.stat-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
.stat-card h4 { font-style: italic; font-weight: bold; font-size: 0.9rem; margin-bottom: 0.5rem; min-height: 40px; }
.stat-number {
  background-color: #96f2b3; width: 100%; height: 120px; border-radius: 15px;
  display: flex; justify-content: center; align-items: center; font-size: 3rem; font-weight: 800; color: #000;
}
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .teacher-sidebar { width: 100%; }
  .vacancies-layout { flex-direction: column; }
  .contest-card { width: 100%; }
  .request-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .request-actions { border-left: none; padding-left: 0; width: 100%; justify-content: space-between; }
  .btn-action { flex: 1; }
}

/* --- ESTILIZAÇÃO DO MODAL DE RECUSA (NOVO) --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 8px;
  width: 90%; max-width: 500px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.modal-card h3 {
  font-family: 'Poppins', sans-serif; font-style: italic;
  font-weight: 500; margin-bottom: 1.5rem; color: #333;
}
.modal-form {
  display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;
}
.modal-select, textarea {
  width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;
  font-family: 'Poppins', sans-serif; box-sizing: border-box;
}
.textarea-container {
  display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 1rem;
}
.btn-modal-confirm {
  background-color: #007bff; color: white; border: none; padding: 10px 24px;
  border-radius: 4px; font-weight: 600; cursor: pointer;
}
.btn-modal-cancel {
  background-color: transparent; border: 1px solid #ccc; padding: 10px 24px;
  border-radius: 4px; cursor: pointer; color: #666;
}
.empty-state { text-align: center; font-style: italic; color: #666; padding: 2rem; }

/* --- ESTILOS PARA ORIENTAÇÕES --- */
.guidance-list { display:flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
.guidance-item { display:flex; justify-content:space-between; align-items:center; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
.guidance-main { display:flex; align-items:center; gap: 1rem; }
.avatar-placeholder.small { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#1e293b; color:white; }
.guidance-info .project-title { font-size: 0.9rem; color:#374151; }
.guidance-info .meta { font-size: 0.8rem; color:#6b7280; }
.guidance-controls { display:flex; align-items:center; gap:1rem; }
.status-badge { padding:6px 10px; border-radius:999px; font-weight:700; font-size:0.85rem; text-transform:capitalize; }
.status-badge.em_vigencia { background: #ecfdf5; color:#065f46; border: 1px solid #bbf7d0; }
.status-badge.finalizada { background: #f1f5f9; color:#0f172a; border: 1px solid #cbd5e1; }
.status-badge.cancelada { background: #fff1f2; color:#991b1b; border: 1px solid #fecaca; }
.guidance-controls .controls { display:flex; gap:0.5rem; }
.guidance-controls .btn-action { padding:6px 12px; font-size:0.9rem; }
</style>