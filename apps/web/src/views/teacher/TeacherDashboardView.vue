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
            <div class="stats-header">
              <h3>Estatísticas Pessoais</h3>
              <div class="semester-filter-wrapper">
                <button class="btn-filter-semester" @click="mostrarFiltroSemestre = !mostrarFiltroSemestre">
                  Semestre <i class="bi bi-funnel"></i>
                </button>
                <div v-if="mostrarFiltroSemestre" class="filter-dropdown-semester">
                  <div class="filter-group">
                    <label>Selecione o semestre:</label>
                    <select v-model="semestreSelecionado" @change="atualizarEstatisticas">
                      <option value="2025-1">1º Semestre 2025 (Atual)</option>
                      <option value="2024-2">2º Semestre 2024</option>
                      <option value="2024-1">1º Semestre 2024</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher'
import CronogramSchedule from '@/components/CronogramSchedule.vue'
import RequestHistoryTable from '@/components/RequestHistoryTable.vue'
import StatisticCard from '@/components/StatisticCard.vue'
import Swal from 'sweetalert2'

const teacherStore = useTeacherStore()

onMounted(() => {
  teacherStore.loadData()
})

// Computed properties para acessar os dados do store
const currentView = computed({
  get: () => teacherStore.currentView,
  set: (value) => teacherStore.setCurrentView(value)
})

const teacher = computed(() => teacherStore.teacher)
const vacancies = computed(() => teacherStore.vacancies)
const tags = computed(() => teacherStore.tags)
const requestsList = computed(() => teacherStore.requestsList)
const historyData = computed(() => teacherStore.historyData)
const guidancesList = computed(() => teacherStore.guidancesList)
const statsData = computed(() => teacherStore.statsData)

const semestreSelecionado = computed({
  get: () => teacherStore.semestreSelecionado,
  set: (value) => teacherStore.setSemestre(value)
})

const mostrarFiltroSemestre = computed({
  get: () => teacherStore.mostrarFiltroSemestre,
  set: (value) => teacherStore.mostrarFiltroSemestre = value
})

const newTag = ref('')

// Lógica de tags
const addTag = () => { 
  if (newTag.value.trim()) { 
    teacherStore.addTag(newTag.value.trim())
    newTag.value = '' 
  } 
}
const removeTag = (index) => teacherStore.removeTag(index)
const getTagColor = (index) => ['purple', 'yellow', 'blue'][index % 3]

// --- LÓGICA DE SOLICITAÇÕES ---
const showRejectModal = ref(false)
const requestToReject = ref(null)
const selectedReason = ref('')
const customJustification = ref('')

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
      teacherStore.removeRequest(req.id)
      teacherStore.addToHistory(req, 'Aceita')
      teacherStore.addGuidance({ 
        id: Date.now(), 
        studentName: req.name, 
        project: 'Novo Projeto (TCC)', 
        startDate: new Date().toLocaleDateString('pt-BR'), 
        semester: '2025-1', 
        status: 'Em vigência' 
      })
      Swal.fire('Sucesso', 'Orientação iniciada!', 'success')
    }
  })
}

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
  const justification = selectedReason.value === 'Outro' ? customJustification.value : selectedReason.value
  teacherStore.removeRequest(requestToReject.value.id)
  teacherStore.addToHistory(requestToReject.value, 'Recusada', justification)
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
  Swal.fire({ 
    title: 'Finalizar Orientação?', 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonColor: '#28a745', 
    confirmButtonText: 'Finalizar' 
  }).then((result) => {
    if(result.isConfirmed) { 
      teacherStore.updateGuidanceStatus(guide.id, 'Finalizada', new Date().toLocaleDateString('pt-BR'))
      Swal.fire('Parabéns!', 'Orientação finalizada.', 'success') 
    }
  })
}

const cancelGuidance = (guide) => {
  Swal.fire({ 
    title: 'Cancelar Orientação?', 
    input: 'text', 
    inputLabel: 'Motivo', 
    showCancelButton: true, 
    confirmButtonColor: '#dc3545', 
    confirmButtonText: 'Cancelar Vínculo' 
  }).then((result) => {
    if(result.isConfirmed && result.value) { 
      teacherStore.updateGuidanceStatus(guide.id, 'Cancelada', new Date().toLocaleDateString('pt-BR'))
      Swal.fire('Cancelado', 'A orientação foi encerrada.', 'warning') 
    }
  })
}

const openContestModal = () => { 
  Swal.fire({ title: 'Contestar Vagas', input: 'textarea', showCancelButton: true }) 
}

const atualizarEstatisticas = () => {
  console.log("Filtrando estatísticas para:", semestreSelecionado.value)
  // Em um cenário real, aqui você faria um novo fetch na API passando o semestre
}

// --- ESTATÍSTICAS COM LÓGICA DE DESEMPENHO ---
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
.page-wrapper { background-color: var(--color-background-light-gray); min-height: 100vh; }
.main-layout { background-color: var(--color-background-card-default); display: flex; max-width: 1200px; margin: 1.7rem auto; padding: 1.2rem; gap: 1.3rem; }
.teacher-sidebar { width: 300px; flex-shrink: 0; }
.profile-card { background: var(--color-background-card-default); border: 1px solid var(--color-border-light); }
.sidebar-header { display: flex; align-items: center; padding: 1rem; gap: 1rem; }
.avatar-circle img { width: 100px; height: 100px; border-radius: 50%; border: 2px solid var(--color-border-very-dark); background-color: var(--color-avatar-bg); }
.teacher-name { font-size: 1rem; font-weight: 400; margin: 0; }
.teacher-id { font-size: 0.89rem; font-weight: 800; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.btn-menu { width: 100%; background-color: var(--color-button-menu); color: var(--color-icon-white); border: none; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-style: italic; font-size: 0.85rem; height: 60px; border-bottom: 1px solid var(--color-border-white-opacity); transition: filter 0.3s ease; font-family: poppins; }
.btn-menu:hover { filter: brightness(1.2); }
.btn-menu.active-btn { background-color: var(--color-button-menu-active); font-weight: bold; }
.content-panel { flex: 1; }
.card-section { background: var(--color-background-card-default); border: 1px solid var(--color-border-light); padding: 2rem; margin-bottom: 1.5rem; }
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
  background-color: var(--color-background-gray); 
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border-dark);
  gap: 2rem;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
}

.avatar-placeholder { width: 50px; height: 50px; background-color: var(--color-avatar-placeholder-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-icon-white); font-size: 1.5rem; }
.student-details { display: flex; flex-direction: column; }
.student-name { font-weight: 600; font-size: 0.95rem; color: var(--color-text-dark); }
.student-ra { font-size: 0.85rem; color: var(--color-text-gray); }

.request-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 2rem;
  border-left: 2px solid var(--color-border-dark);
  height: 40px;
}

.btn-action { padding: 8px 24px; border: none; border-radius: 4px; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--color-icon-white); font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
.btn-action:hover { opacity: 0.9; }
.btn-accept { background-color: var(--color-status-success); }
.btn-reject { background-color: var(--color-status-danger); }

/* --- OUTROS ESTILOS MANTIDOS --- */
.vacancies-layout { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
.vacancies-status { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.vacancy-box { border-radius: 20px; padding: 12px 20px; font-weight: bold; font-style: italic; font-size: 0.85rem; text-transform: uppercase; border: 1px solid var(--color-border-very-dark); display: flex; align-items: center; color: var(--color-text-dark); }
.vacancy-box.green { background-color: var(--color-vacancy-green); } .vacancy-box.yellow { background-color: var(--color-vacancy-yellow); } .vacancy-box.red { background-color: var(--color-vacancy-red); }
.contest-card { border: 1px solid var(--color-text-dark); padding: 1.5rem; text-align: center; width: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.btn-contest { background-color: var(--color-button-contest); border: none; padding: 10px 20px; font-weight: bold; font-style: italic; font-family: poppins; font-size: 1rem; border-radius: 5px; cursor: pointer; width: 100%; }
.contest-dates { font-size: 0.8rem; font-style: italic; font-weight: bold; margin: 0; }
.tags-control-container { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.input-wrapper { display: flex; border: 1px solid var(--color-border-lightest); border-radius: 4px; padding: 5px; width: 100%; max-width: 300px; }
.input-wrapper input { border: none; outline: none; flex: 1; padding: 5px; font-style: italic; font-family:poppins; }
.add-tag-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.tags-display { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { padding: 5px 15px; border-radius: 15px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag.purple { background-color: var(--color-tag-purple); color: var(--color-tag-purple-text); } .tag.yellow { background-color: var(--color-tag-yellow); color: var(--color-tag-yellow-text); } .tag.blue { background-color: var(--color-tag-blue); color: var(--color-tag-blue-text); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.guidances-list { display: flex; flex-direction: column; gap: 1.5rem; }

/* --- FILTRO DE SEMESTRE (STATS) --- */
.stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.stats-header h3 { margin: 0; }
.semester-filter-wrapper { position: relative; }
.btn-filter-semester { background-color: var(--color-button-primary); color: var(--color-icon-white); border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-weight: 600; font-family: poppins, sans-serif; display: flex; align-items: center; gap: 0.5rem; }
.btn-filter-semester:hover { opacity: 0.9; }
.filter-dropdown-semester { position: absolute; top: 110%; right: 0; background: var(--color-background-card-default); border: 1px solid var(--color-border-lighter); padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 250px; z-index: 10; margin-top: 0.5rem; }
.filter-dropdown-semester .filter-group { margin: 0; display: flex; flex-direction: column; }
.filter-dropdown-semester label { font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--color-text-subtle); }
.filter-dropdown-semester select { padding: 0.5rem; border: 1px solid var(--color-border-light); border-radius: 4px; font-family: poppins, sans-serif; font-size: 0.9rem; }

.guidance-card { border: 1px solid var(--color-border-lighter); border-radius: 8px; overflow: hidden; background-color: var(--color-background-card-default); transition: transform 0.2s ease, box-shadow 0.2s ease; display: flex; flex-direction: column; position: relative; }
.guidance-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.guidance-card.em-vigência { border-left: 5px solid var(--color-status-success); } .guidance-card.finalizada { border-left: 5px solid var(--color-status-secondary); } .guidance-card.cancelada { border-left: 5px solid var(--color-status-danger); }
.status-indicator { position: absolute; top: 1rem; right: 1rem; }
.badge { padding: 4px 12px; border-radius: 20px; color: var(--color-icon-white); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.bg-success { background-color: var(--color-status-success); } .bg-secondary { background-color: var(--color-status-secondary); } .bg-danger { background-color: var(--color-status-danger); }
.guide-content { padding: 1.5rem; }
.guide-info h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--color-text-dark); padding-right: 80px; }
.project-title { color: var(--color-text-gray); margin-bottom: 0.5rem; }
.meta-info { font-size: 0.85rem; color: var(--color-text-light-gray); margin-bottom: 1rem; }
.guide-actions { display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border-lightest); }
.btn-tool { border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s; }
.btn-tool:hover { opacity: 0.8; }
.btn-finish { background-color: var(--color-background-light); color: var(--color-status-success); border: 1px solid var(--color-status-success); font-family: poppins; } .btn-finish:hover { background-color: var(--color-status-success); color: var(--color-icon-white); }
.btn-cancel { background-color: var(--color-background-light); color: var(--color-status-danger); border: 1px solid var(--color-status-danger); font-family: poppins; } .btn-cancel:hover { background-color: var(--color-status-danger); color: var(--color-icon-white); }
.end-date-info { margin-top: 1rem; font-size: 0.85rem; color: var(--color-text-muted); font-style: italic; border-top: 1px solid var(--color-border-lightest); padding-top: 0.5rem; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--color-border-black-opacity); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: var(--color-background-card-default); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
.modal-card h3 { font-family: 'Poppins', sans-serif; font-style: italic; font-weight: 500; margin-bottom: 1.5rem; color: var(--color-text-gray); }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.modal-select, textarea { width: 100%; padding: 10px; border: 1px solid var(--color-border-light); border-radius: 4px; font-family: 'Poppins', sans-serif; box-sizing: border-box; }
.textarea-container { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-modal-confirm { background-color: var(--color-button-primary); color: var(--color-icon-white); border: none; padding: 10px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.btn-modal-cancel { background-color: transparent; border: 1px solid var(--color-border-light); padding: 10px 24px; border-radius: 4px; cursor: pointer; color: var(--color-text-light-gray); }
.empty-state { text-align: center; font-style: italic; color: var(--color-text-light-gray); padding: 2rem; }
@media (max-width: 768px) {
  .main-layout { flex-direction: column; } .teacher-sidebar { width: 100%; } .vacancies-layout { flex-direction: column; }
  .contest-card { width: 100%; } .request-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .request-info { width: 100%; }
  .request-actions { border-left: none; padding-left: 0; width: 100%; justify-content: space-between; } .btn-action { flex: 1; }
}
</style>