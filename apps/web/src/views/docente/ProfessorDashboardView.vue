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
                <li><button class="btn-menu" :class="{ 'active-btn': currentView === 'home' }" @click="currentView = 'home'">Início <i class="bi bi-chevron-right"></i></button></li>
                <li><button class="btn-menu" :class="{ 'active-btn': currentView === 'requests' }" @click="currentView = 'requests'">Minhas solicitações <i class="bi bi-chevron-right"></i></button></li>
                <li><button class="btn-menu" :class="{ 'active-btn': currentView === 'history' }" @click="currentView = 'history'">Histórico de solicitações <i class="bi bi-chevron-right"></i></button></li>
                <li><button class="btn-menu" :class="{ 'active-btn': currentView === 'guidances' }" @click="currentView = 'guidances'">Orientações em vigência <i class="bi bi-chevron-right"></i></button></li>
                <li><button class="btn-menu" :class="{ 'active-btn': currentView === 'stats' }" @click="currentView = 'stats'">Estatísticas Pessoais <i class="bi bi-chevron-right"></i></button></li>
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
                  <div class="avatar-placeholder"><i class="bi bi-person-fill"></i></div>
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
                <p>Nenhuma solicitação pendente.</p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'history'">
           <RequestHistoryTable title="Histórico de solicitações" :data="historyData" />
        </div>

        <div v-else-if="currentView === 'guidances'">
          <section class="card-section">
            <h3 class="mb-4">Gestão de Orientações</h3>
            <div class="guidances-list">
              <div v-for="guide in guidancesList" :key="guide.id" class="guidance-card" :class="guide.status.toLowerCase().replace(' ', '-')">
                <div class="status-indicator">
                  <span class="badge" :class="getStatusClass(guide.status)">{{ guide.status }}</span>
                </div>
                <div class="guide-content">
                  <div class="guide-info">
                    <h4>{{ guide.studentName }}</h4>
                    <p class="project-title"><strong>Projeto:</strong> {{ guide.project }}</p>
                    <p class="meta-info">Início: {{ guide.startDate }} • Semestre: {{ guide.semester }}</p>
                  </div>
                  <div class="guide-actions" v-if="guide.status === 'Em vigência'">
                    <button class="btn-tool btn-finish" @click="finalizeGuidance(guide)" title="Finalizar Orientação"><i class="bi bi-check-circle"></i> Finalizar</button>
                    <button class="btn-tool btn-cancel" @click="cancelGuidance(guide)" title="Cancelar Orientação"><i class="bi bi-x-circle"></i> Cancelar</button>
                  </div>
                  <div class="end-date-info" v-else>
                    <p>Encerrado em: {{ guide.endDate || 'Data não informada' }}</p>
                  </div>
                </div>
              </div>
              <div v-if="guidancesList.length === 0" class="empty-state"><p>Nenhuma orientação encontrada.</p></div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'stats'">
          <section class="card-section stats-area">
            <h3>Estatísticas Pessoais</h3>
            <div class="stats-grid">
              <StatisticCard 
                label="Total de Solicitações Recebidas" 
                :value="statsData.recebidas"
                :performance="getPerformance('requests', statsData.recebidas)"
              />
              <StatisticCard 
                label="Taxa de Aceite" 
                :value="statsData.taxaAceite + '%'"
                :subtitle="statsData.aceitas + ' aceitas / ' + statsData.recusadas + ' recusadas'"
                :performance="getPerformance('acceptRate', statsData.taxaAceite)"
              />
              <StatisticCard 
                label="Orientações Concluídas" 
                :value="statsData.concluidas"
                :performance="getPerformance('completed', statsData.concluidas)"
              />
              <StatisticCard 
                label="Vagas Preenchidas" 
                :value="statsData.vagasOcupadas + '/' + statsData.vagasTotais"
                :subtitle="((statsData.vagasOcupadas / statsData.vagasTotais) * 100).toFixed(0) + '% ocupadas'"
                :performance="getPerformance('vacancies', (statsData.vagasOcupadas / statsData.vagasTotais) * 100)"
              />
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
            <option value="" disabled selected>Selecione...</option>
            <option value="Sem vagas disponíveis">Sem vagas disponíveis</option>
            <option value="Tema não compatível">Tema não compatível</option>
            <option value="Falta de disponibilidade">Falta de disponibilidade</option>
            <option value="Outro">Outro motivo não listado</option>
          </select>
          <div v-if="selectedReason === 'Outro'" class="textarea-container">
            <label>Outro motivo:</label>
            <textarea v-model="customJustification" placeholder="Digite a justificativa..." rows="4"></textarea>
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
import StatisticCard from '@/components/StatisticCard.vue'
import Swal from 'sweetalert2'

const currentView = ref('requests')
const teacher = ref({ name: 'Prof. Dr. Lorem Ipsum', id: '123456', photo: '/src/assets/img/foto-perfil.svg' })
const vacancies = ref({ total: 5, filled: 0 })
const newTag = ref(''); const tags = ref(['Machine Learning', 'Vue.js']) 

const addTag = () => { if (newTag.value.trim()) { tags.value.push(newTag.value.trim()); newTag.value = '' } }
const removeTag = (index) => tags.value.splice(index, 1)
const getTagColor = (index) => ['purple', 'yellow', 'blue'][index % 3]

// --- DADOS ---
const requestsList = ref([
  { id: 1, name: 'Lorem Ipsum Dolor Siamet', ra: '123456' },
  { id: 2, name: 'João Silva', ra: '123457' },
  { id: 3, name: 'Maria Souza', ra: '123458' },
  { id: 4, name: 'Pedro Alvares', ra: '123459' },
  { id: 5, name: 'Ana Costa', ra: '123460' },
])
const historyData = ref([{ id: 99, name: 'Aluno Exemplo', ra: '123123', status: 'Aceita', date: '10/02/2025' }])
const guidancesList = ref([
  { id: 101, studentName: 'Maria Clara', project: 'IA na Medicina', startDate: '15/02/2025', semester: '2025-1', status: 'Em vigência' },
  { id: 102, studentName: 'Roberto Carlos', project: 'Sistemas Distribuídos', startDate: '10/08/2024', semester: '2024-2', status: 'Finalizada', endDate: '10/12/2024' },
])

// --- LÓGICA DE SOLICITAÇÕES ---
const showRejectModal = ref(false); const requestToReject = ref(null); const selectedReason = ref(''); const customJustification = ref('')

const handleAccept = (req) => {
  Swal.fire({
    title: 'Confirmar vínculo?',
    text: "O aluno será movido para 'Orientações em vigência'.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    confirmButtonText: 'Sim, confirmar'
  }).then((result) => {
    if (result.isConfirmed) {
      requestsList.value = requestsList.value.filter(r => r.id !== req.id)
      historyData.value.unshift({ id: req.id, name: req.name, ra: req.ra, status: 'Aceita', date: new Date().toLocaleDateString('pt-BR') })
      guidancesList.value.unshift({ id: Date.now(), studentName: req.name, project: 'Novo Projeto (TCC)', startDate: new Date().toLocaleDateString('pt-BR'), semester: '2025-1', status: 'Em vigência' })
      Swal.fire('Sucesso', 'Orientação iniciada!', 'success')
    }
  })
}

const openRejectModal = (req) => { requestToReject.value = req; selectedReason.value = ''; customJustification.value = ''; showRejectModal.value = true }
const closeRejectModal = () => { showRejectModal.value = false; requestToReject.value = null }
const confirmReject = () => {
  const justification = selectedReason.value === 'Outro' ? customJustification.value : selectedReason.value
  requestsList.value = requestsList.value.filter(r => r.id !== requestToReject.value.id)
  historyData.value.unshift({ id: requestToReject.value.id, name: requestToReject.value.name, ra: requestToReject.value.ra, status: 'Recusada', justification, date: new Date().toLocaleDateString('pt-BR') })
  closeRejectModal()
  Swal.fire('Recusada', 'Justificativa enviada.', 'info')
}

// --- LÓGICA DE ORIENTAÇÕES ---
const getStatusClass = (status) => {
  if (status === 'Em vigência') return 'bg-success'
  if (status === 'Finalizada') return 'bg-secondary'
  if (status === 'Cancelada') return 'bg-danger'
  return ''
}
const finalizeGuidance = (guide) => {
  Swal.fire({ title: 'Finalizar Orientação?', icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', confirmButtonText: 'Finalizar' }).then((result) => {
    if(result.isConfirmed) { guide.status = 'Finalizada'; guide.endDate = new Date().toLocaleDateString('pt-BR'); Swal.fire('Parabéns!', 'Orientação finalizada.', 'success') }
  })
}
const cancelGuidance = (guide) => {
  Swal.fire({ title: 'Cancelar Orientação?', input: 'text', inputLabel: 'Motivo', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Cancelar Vínculo' }).then((result) => {
    if(result.isConfirmed && result.value) { guide.status = 'Cancelada'; guide.endDate = new Date().toLocaleDateString('pt-BR'); Swal.fire('Cancelado', 'A orientação foi encerrada.', 'warning') }
  })
}
const openContestModal = () => { Swal.fire({ title: 'Contestar Vagas', input: 'textarea', showCancelButton: true }) }

// --- ESTATÍSTICAS COM LÓGICA DE DESEMPENHO ---
const statsData = ref({
  recebidas: 12,
  aceitas: 10,
  recusadas: 2,
  taxaAceite: 83,
  concluidas: 6,
  vagasOcupadas: 4,
  vagasTotais: 5
})

const getPerformance = (metric, value) => {
  if (metric === 'requests') {
    return value >= 10 ? 'good' : value >= 5 ? 'alert' : 'danger'
  }
  if (metric === 'acceptRate') {
    return value >= 70 ? 'good' : value >= 50 ? 'alert' : 'danger'
  }
  if (metric === 'completed') {
    return value >= 5 ? 'good' : value >= 2 ? 'alert' : 'danger'
  }
  if (metric === 'vacancies') {
    return value >= 80 ? 'good' : value >= 50 ? 'alert' : 'danger'
  }
  return 'good'
}
</script>

<style scoped>
/* --- ESTILOS PRINCIPAIS --- */
.page-wrapper { background-color: #e0e0e0; min-height: 100vh; }
.main-layout { background-color: #fff; display: flex; max-width: 1200px; margin: 1.7rem auto; padding: 1.2rem; gap: 1.3rem; }
.teacher-sidebar { width: 300px; flex-shrink: 0; }
.profile-card { background: white; border: 1px solid #ccc; }
.sidebar-header { display: flex; align-items: center; padding: 1rem; gap: 1rem; }
.avatar-circle img { width: 100px; height: 100px; border-radius: 50%; border: 2px solid #333; background-color: #000; }
.teacher-name { font-size: 1rem; font-weight: 400; margin: 0; }
.teacher-id { font-size: 0.89rem; font-weight: 800; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.btn-menu { width: 100%; background-color: #005b8e; color: white; border: none; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-style: italic; font-size: 0.85rem; height: 60px; border-bottom: 1px solid rgba(255,255,255,0.1); transition: filter 0.3s ease; font-family: poppins; }
.btn-menu:hover { filter: brightness(1.2); }
.btn-menu.active-btn { background-color: #004b75; font-weight: bold; }
.content-panel { flex: 1; }
.card-section { background: white; border: 1px solid #ccc; padding: 2rem; margin-bottom: 1.5rem; }
.card-section h3 { margin-top: 0; font-weight: 400; font-size: 1.5rem; margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }

/* --- CORREÇÃO DO GAP/ALINHAMENTO (REQUESTS) --- */
.requests-list {
  display: flex;
  flex-direction: column;
  margin: 0 -2rem -2rem -2rem; 
  max-height: 450px;
  overflow-y: auto; 
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #dcdcdc; 
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #a0a0a0;
  gap: 2rem;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
}

.avatar-placeholder { width: 50px; height: 50px; background-color: #1e1e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; }
.student-details { display: flex; flex-direction: column; }
.student-name { font-weight: 600; font-size: 0.95rem; color: #000; }
.student-ra { font-size: 0.85rem; color: #333; }

.request-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #a0a0a0;
  height: 40px;
}

.btn-action { padding: 8px 24px; border: none; border-radius: 4px; font-weight: 600; font-size: 1rem; cursor: pointer; color: white; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
.btn-action:hover { opacity: 0.9; }
.btn-accept { background-color: #28a745; }
.btn-reject { background-color: #dc3545; }

/* --- OUTROS ESTILOS MANTIDOS --- */
.vacancies-layout { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
.vacancies-status { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.vacancy-box { border-radius: 20px; padding: 12px 20px; font-weight: bold; font-style: italic; font-size: 0.85rem; text-transform: uppercase; border: 1px solid #333; display: flex; align-items: center; color: #000; }
.vacancy-box.green { background-color: #96f2b3; } .vacancy-box.yellow { background-color: #fff9c4; } .vacancy-box.red { background-color: #ffcccb; }
.contest-card { border: 1px solid #000; padding: 1.5rem; text-align: center; width: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.btn-contest { background-color: #ffcc00; border: none; padding: 10px 20px; font-weight: bold; font-style: italic; font-family: poppins; font-size: 1rem; border-radius: 5px; cursor: pointer; width: 100%; }
.contest-dates { font-size: 0.8rem; font-style: italic; font-weight: bold; margin: 0; }
.tags-control-container { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.input-wrapper { display: flex; border: 1px solid #999; border-radius: 4px; padding: 5px; width: 100%; max-width: 300px; }
.input-wrapper input { border: none; outline: none; flex: 1; padding: 5px; font-style: italic; font-family:poppins; }
.add-tag-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.tags-display { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { padding: 5px 15px; border-radius: 15px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag.purple { background-color: #d8b4fe; color: #4c1d95; } .tag.yellow { background-color: #fef08a; color: #854d0e; } .tag.blue { background-color: #93c5fd; color: #1e3a8a; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.guidances-list { display: flex; flex-direction: column; gap: 1.5rem; }
.guidance-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #fff; transition: transform 0.2s ease, box-shadow 0.2s ease; display: flex; flex-direction: column; position: relative; }
.guidance-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.guidance-card.em-vigência { border-left: 5px solid #28a745; } .guidance-card.finalizada { border-left: 5px solid #6c757d; } .guidance-card.cancelada { border-left: 5px solid #dc3545; }
.status-indicator { position: absolute; top: 1rem; right: 1rem; }
.badge { padding: 4px 12px; border-radius: 20px; color: white; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.bg-success { background-color: #28a745; } .bg-secondary { background-color: #6c757d; } .bg-danger { background-color: #dc3545; }
.guide-content { padding: 1.5rem; }
.guide-info h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #000; padding-right: 80px; }
.project-title { color: #333; margin-bottom: 0.5rem; }
.meta-info { font-size: 0.85rem; color: #666; margin-bottom: 1rem; }
.guide-actions { display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; }
.btn-tool { border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s; }
.btn-tool:hover { opacity: 0.8; }
.btn-finish { background-color: #e9ecef; color: #28a745; border: 1px solid #28a745; } .btn-finish:hover { background-color: #28a745; color: white; }
.btn-cancel { background-color: #e9ecef; color: #dc3545; border: 1px solid #dc3545; } .btn-cancel:hover { background-color: #dc3545; color: white; }
.end-date-info { margin-top: 1rem; font-size: 0.85rem; color: #888; font-style: italic; border-top: 1px solid #eee; padding-top: 0.5rem; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
.modal-card h3 { font-family: 'Poppins', sans-serif; font-style: italic; font-weight: 500; margin-bottom: 1.5rem; color: #333; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.modal-select, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: 'Poppins', sans-serif; box-sizing: border-box; }
.textarea-container { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-modal-confirm { background-color: #007bff; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.btn-modal-cancel { background-color: transparent; border: 1px solid #ccc; padding: 10px 24px; border-radius: 4px; cursor: pointer; color: #666; }
.empty-state { text-align: center; font-style: italic; color: #666; padding: 2rem; }
@media (max-width: 768px) {
  .main-layout { flex-direction: column; } .teacher-sidebar { width: 100%; } .vacancies-layout { flex-direction: column; }
  .contest-card { width: 100%; } .request-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .request-info { width: 100%; }
  .request-actions { border-left: none; padding-left: 0; width: 100%; justify-content: space-between; } .btn-action { flex: 1; }
}
</style>