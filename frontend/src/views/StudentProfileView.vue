<template>
  <CronogramSchedule />
  <div class="page-wrapper">
    <div class="main-layout">
      <aside class="student-sidebar">
        <div class="profile-card">
          <div class="sidebar-header">
            <div class="avatar-circle">
              <img :src="student.photo || '/src/assets/img/default-avatar.png'" alt="Perfil" />
            </div>

            <div class="student-identity">
              <h2 class="student-name">{{ student.name }}</h2>
              <p class="student-ra">{{ student.ra }}</p>
            </div>
          </div>

          <div class="sidebar-menu">
            <nav class="sidebar-nav">
              <ul>
                <li>
                  <button 
                    class="btn-history" 
                    :class="{ 'active-btn': currentView === 'home' }"
                    @click="currentView = 'home'"
                  >
                    Início <i class="bi bi-chevron-right"></i>
                  </button>

                  <button 
                    class="btn-history" 
                    :class="{ 'active-btn': currentView === 'history' }"
                    @click="currentView = 'history'"
                  >
                    Acessar histórico de solicitações <i class="bi bi-chevron-right"></i>
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
                <input
                  type="text"
                  v-model="newTag"
                  @keyup.enter="addTag"
                  placeholder="Ex: Inteligência Artificial"
                />
                <button type="button" class="add-tag-btn" @click="addTag">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <div class="tags-display">
                <span
                  v-for="(tag, index) in tags"
                  :key="index"
                  class="tag"
                  :class="getTagColor(index)"
                >
                  {{ tag }}
                  <i class="bi bi-x" @click="removeTag(index)"></i>
                </span>
              </div>
            </div>
          </section>

          <section class="card-section requests-area">
            <h3>Minhas solicitações:</h3>

            <div v-for="req in myRequests" :key="req.id" class="request-item">
              <div class="teacher-info">
                <div class="professor-mini-card">
                  <img src="/src/assets/img/foto-perfil.svg" class="mini-avatar" />
                  <div class="prof-details">
                    <p class="prof-name">{{ req.professorName }}</p>
                    <span class="vagas-badge">{{ req.availableSpots }} vagas disponíveis</span>
                  </div>
                </div>
              </div>

              <div class="vertical-divider"></div>

              <div class="status-info">
                <div class="status-row">
                  <p>Situação:</p>
                  <span :class="['status-btn', getStatusClass(req.status)]">
                    {{ req.status }}
                  </span>
                </div>
                <p class="status-note">
                  {{ getStatusMessage(req.status) }}
                </p>
              </div>
            </div>

            <p v-if="myRequests.length === 0" class="no-data">Nenhuma solicitação encontrada.</p>
          </section>

          <section class="card-section guidances-area">
            <h3>Minhas orientações:</h3>
            <div class="empty-state">
              <p v-if="!hasGuidance">Você ainda não possui orientações ativas.</p>
            </div>
          </section>
        </div>

        <RequestHistoryTable 
          v-else-if="currentView === 'history'" 
          title="Histórico de solicitações"
          :data="historyData"
          @view-reason="showJustification" 
        />

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CronogramSchedule from '@/components/CronogramSchedule.vue'
import RequestHistoryTable from '@/components/RequestHistoryTable.vue'
import Swal from 'sweetalert2'

// --- 1. DADOS DO ALUNO (MOCK) ---
const student = ref({
  name: 'Carregando...',
  ra: '...',
  photo: '/src/assets/img/foto-perfil.svg', // Caminho da sua imagem
})

// --- 2. TAGS (TEMAS) ---
const newTag = ref('')
const tags = ref(['Machine Learning', 'Vue.js']) // Começa com alguns exemplos

const addTag = () => {
  if (newTag.value.trim() !== '') {
    tags.value.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}

// Função auxiliar para dar cores aleatórias às tags (visual da imagem)
const getTagColor = (index) => {
  const colors = ['purple', 'yellow', 'blue']
  return colors[index % colors.length]
}

// --- 3. DADOS DAS SOLICITAÇÕES (MOCK DO BANCO) ---
const myRequests = ref([])
const hasGuidance = ref(false)

// Helpers de Status
const getStatusClass = (status) => {
  if (status === 'PENDENTE') return 'pending'
  if (status === 'ACEITO') return 'success'
  if (status === 'RECUSADO') return 'danger'
  return 'pending'
}

const getStatusMessage = (status) => {
  if (status === 'PENDENTE') return 'Aguardando aceite do docente, você será notificado(a)'
  if (status === 'ACEITO') return 'O docente aceitou sua solicitação! Verifique suas orientações.'
  if (status === 'RECUSADO') return 'O docente não pôde aceitar no momento.'
  return ''
}

// --- SIMULAÇÃO DE FETCH (API) ---
onMounted(async () => {
  // Simula delay de rede
  setTimeout(() => {
    // Popula dados do aluno
    student.value = {
      name: 'Lorem Ipsum Dolor', // Nome dinâmico
      ra: '123456', // RA dinâmico
      photo: '/src/assets/img/foto-perfil.svg',
    }

    // Popula solicitações
    myRequests.value = [
      {
        id: 1,
        professorName: 'Professor Dr. Lorem Ipsum', // Nome do Docente
        availableSpots: '5/5', // Vagas
        status: 'PENDENTE',
      },
    ]
  }, 500)
})

const currentView = ref('home')

const historyData = ref([
  {
    id: 1,
    name: 'Lorem Ipsum Dolor Siamet',
    ra: '123456',
    sendDate: '30/04/2025 16:45',
    replyDate: '30/04/2025 16:45',
    status: 'Recusada',
    justification: 'Não tenho disponibilidade para novas orientações este semestre.',
  },
])

const showJustification = (msg) => {
  Swal.fire({
    title: 'Motivo da Recusa',
    text: msg,
    icon: 'info',
    confirmButtonColor: 'var(--color-brand-primary)',
  })
}
</script>

<style scoped>
/* --- LAYOUT BASE --- */
.page-wrapper {
  background-color: #e0e0e0; /* Fundo cinza da imagem */
  min-height: 100vh;
}

/* --- MAIN LAYOUT (SIDEBAR + CONTENT) --- */
.main-layout {
  background-color: #fff;
  display: flex;
  max-width: 1200px;
  margin: 1.7rem auto;
  padding: 1.2rem;
  gap: 1.3rem;
}

/* --- SIDEBAR DO ALUNO --- */
.student-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.profile-card {
  background: white;
  border: 1px solid #ccc;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.avatar-circle {
  display: flex;
  justify-content: center;
}

.avatar-circle img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #333; /* Borda escura igual imagem */
  background-color: #000;
}

.student-name {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
}

.student-ra {
  font-size: 0.89rem;
  font-weight: 800;
}

/* Menu Sidebar */
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  font-size: 0.9rem;
}

.btn-history {
  width: 100%;
  background-color: var(--color-brand-primary);
  color: white;
  border: none;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-style: italic;
  font-size: 0.85rem;
  height: 95px;
}

.btn-history:last-child {
  margin-top: 1px;
}
/* --- CONTEÚDO PRINCIPAL --- */
.content-panel {
  flex: 1;
}

.card-section {
  background: white;
  border: 1px solid #ccc;
  padding: 2rem;
}

.card-section h3 {
  margin-top: 0;
  font-weight: 400;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.instruction {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.italic {
  font-style: italic;
}

/* Input de Tags */
.input-wrapper {
  display: flex;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
}

.input-wrapper input {
  border: none;
  outline: none;
  flex: 1;
  padding: 5px;
  font-style: italic;
  color: #666;
}

input,
button {
  font-family: poppins;
}

/* Tags Coloridas */
.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.tag i {
  cursor: pointer;
}

/* Cores das Tags (Estilo da imagem) */
.tag.purple {
  background-color: #d8b4fe;
  color: #4c1d95;
}
.tag.yellow {
  background-color: #fef08a;
  color: #854d0e;
}
.tag.blue {
  background-color: #93c5fd;
  color: #1e3a8a;
}

.tags-control-container {
  display: flex;
  align-items: center; /* Alinha verticalmente ao centro */
  flex-wrap: wrap; /* Permite que as tags quebrem linha se houver muitas */
  gap: 1.5rem; /* Espaço entre a caixa de escrita e as tags */
}

/* Ajuste no wrapper para não forçar quebra de linha */
.input-wrapper {
  display: flex;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 5px;
  width: 100%;
  max-width: 300px;
  margin-bottom: 0; /* Removido para alinhar com as tags */
}

/* Garantir que o botão de adicionar seja clicável em toda sua área */
.add-tag-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.add-tag-btn:hover {
  color: var(--color-brand-primary);
}

.request-item {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.professor-mini-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.mini-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #333;
}

.prof-name {
  font-weight: 700;
  margin: 0;
  font-size: 1rem;
}

.vagas-badge {
  background-color: #28a745; /* Verde */
  color: white;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

/* Divisor Vertical */
.vertical-divider {
  width: 1px;
  height: 60px;
  background-color: #ccc;
  margin: 0 2rem;
}

/* Status Info */
.status-info {
  flex: 1;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 5px;
}

.status-row p {
  font-style: italic;
  font-size: 1.1rem;
  margin: 0;
}

/* Botão de Status Específico */
.status-btn {
  width: 188px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-style: italic;
  color: white;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.status-btn.pending {
  background-color: var(--color-status-warning);
}
.status-btn.success {
  background-color: var(--color-status-success);
}
.status-btn.danger {
  background-color: var(--color-status-warning);
}

.status-note {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .student-sidebar {
    width: 100%;
  }
  .request-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .vertical-divider {
    display: none;
  }
}
</style>
