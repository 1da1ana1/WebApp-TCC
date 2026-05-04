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
            <p class="instruction italic">Selecione até 5 áreas de interesse:</p>

            <div class="tags-control-container">
              <!-- Dropdown -->
              <div class="input-wrapper">
                <!-- Input fictício com dropdown trigger -->
                <input
                  type="text"
                  class="dropdown-input"
                  placeholder="Selecione até 5 áreas..."
                  readonly
                  @click="toggleDropdown"
                />

                <!-- Ícone de toggle -->
                <button
                  type="button"
                  class="dropdown-icon-btn"
                  @click="toggleDropdown"
                  :class="{ 'open': isDropdownOpen }"
                >
                  <i class="bi" :class="isDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>

                <!-- Dropdown com opções ordenadas -->
                <div v-show="isDropdownOpen" class="dropdown-menu">
                  <button
                    v-for="keyword in sortedKeywords"
                    :key="keyword"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      selected: tags.includes(keyword),
                      disabled: isOptionDisabled(keyword)
                    }"
                    :disabled="isOptionDisabled(keyword)"
                    @click="toggleTag(keyword)"
                  >
                    <span class="option-text">{{ keyword }}</span>
                    <i v-if="tags.includes(keyword)" class="bi bi-check2"></i>
                  </button>
                </div>
              </div>

              <!-- Container de chips selecionados ao lado -->
              <div class="selected-tags-container">
                <span
                  v-for="(tag, index) in tags"
                  :key="index"
                  class="tag-chip"
                  :class="getTagColor(index)"
                >
                  {{ tag }}
                  <i class="bi bi-x-circle" @click="removeTag(index)"></i>
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
import { ref, onMounted, computed } from 'vue'
import CronogramSchedule from '@/components/CronogramSchedule.vue'
import RequestHistoryTable from '@/components/RequestHistoryTable.vue'
import Swal from 'sweetalert2'
// Importando a Fonte Única da Verdade
import { getStudentById, mockRequests } from '@/services/mockData'

// --- 1. DADOS DO ALUNO ---
const student = ref({
  name: 'Carregando...',
  ra: '...',
  photo: '',
})

// === MOCK DE DADOS - 20 ÁREAS DE COMPUTAÇÃO ===
const MOCK_KEYWORDS = [
  'Inteligência Artificial',
  'Machine Learning',
  'Deep Learning',
  'Data Science',
  'Big Data',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'Blockchain',
  'Vue.js',
  'React',
  'Angular',
  'TypeScript',
  'Python',
  'Java',
  'JavaScript',
  'Desenvolvimento Mobile',
  'API REST',
  'Banco de Dados',
  'Engenharia de Software'
]

// --- 2. TAGS (TEMAS) ---
const isDropdownOpen = ref(false)
const tags = ref(['Machine Learning', 'Vue.js'])

// === COMPUTED PROPERTY - ORDENAÇÃO ALFABÉTICA ===
const sortedKeywords = computed(() => {
  return [...MOCK_KEYWORDS].sort((a, b) => 
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  )
})

/**
 * Verifica se uma opção deve estar desabilitada (limite de 5 atingido)
 */
const isOptionDisabled = (keyword) => {
  return !tags.value.includes(keyword) && tags.value.length >= 5
}

/**
 * Alterna a seleção de uma tag (add/remove)
 */
const toggleTag = (keyword) => {
  const index = tags.value.indexOf(keyword)
  
  if (index > -1) {
    // Remove se já existe
    tags.value.splice(index, 1)
  } else if (tags.value.length < 5) {
    // Adiciona se não atingiu o limite
    tags.value.push(keyword)
  }
}

/**
 * Remove tag pelo índice (ao clicar no X do chip)
 */
const removeTag = (index) => {
  tags.value.splice(index, 1)
}

const getTagColor = (index) => {
  const colors = ['purple', 'yellow', 'blue']
  return colors[index % colors.length]
}

/**
 * Toggle do dropdown
 */
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

/**
 * Fechar dropdown
 */
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// --- 3. DADOS DAS SOLICITAÇÕES ---
const myRequests = ref([])
const hasGuidance = ref(false)

// Helpers de Status (Normaliza para maiúsculo para evitar erros de digitação no mock)
const getStatusClass = (status) => {
  const s = status ? status.toUpperCase() : ''
  if (s === 'PENDENTE') return 'pending'
  if (s === 'ACEITO') return 'success'
  if (s === 'RECUSADO') return 'danger'
  return 'pending'
}

const getStatusMessage = (status) => {
  const s = status ? status.toUpperCase() : ''
  if (s === 'PENDENTE') return 'Aguardando aceite do docente, você será notificado(a)'
  if (s === 'ACEITO') return 'O docente aceitou sua solicitação! Verifique suas orientações.'
  if (s === 'RECUSADO') return 'O docente não pôde aceitar no momento.'
  return ''
}

// --- VIEW CONTROL ---
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

// --- CARREGAMENTO DE DADOS (INTEGRAÇÃO) ---
onMounted(async () => {
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 1. Buscar Aluno (Simulando login do ID 1 - Yasmim Daiana)
  const studentData = getStudentById(1)
  
  if (studentData) {
    student.value = {
      name: studentData.nome,
      ra: studentData.registro,
      photo: studentData.avatar || '/src/assets/img/foto-perfil.svg'
    }
  }

  // 2. Buscar Solicitações Ativas
  // Filtramos apenas o que é relevante para exibir na "Home" (ex: Pendente/Aceito)
  // Assumimos aqui que o campo 'envolvido' no mockRequests é o nome do Professor
  const activeRequests = mockRequests.filter(r => ['Pendente', 'Aceito'].includes(r.status))

  myRequests.value = activeRequests.map((req, index) => ({
    id: index,
    professorName: req.envolvido, // Mapeia o nome do 'envolvido' para o card
    availableSpots: '2/5',        // Mock fixo (pois requests não tem dados de vaga no mock simples)
    status: req.status.toUpperCase(),
  }))
})
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
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-style: italic;
  font-size: 0.85rem;
  height: 76px; 
  
  transition: filter 0.3s ease;
}

.btn-history:hover {
  filter: brightness(1.2);
}

.btn-history i {
  transition: transform 0.3s ease;
  display: inline-block; 
}

.btn-history:hover i {
  transform: translateX(6px); 
  
}


.btn-history.active-btn {
  background-color: var(--color-brand-secondary);
  font-weight: bold;
}

.btn-history:last-child {
  margin-top: 2px;
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

/* === DROPDOWN CUSTOMIZADO === */

.tags-control-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: nowrap;
}

.selected-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.tag-chip {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  white-space: nowrap;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.tag-chip i {
  cursor: pointer;
  font-size: 0.8rem;
  transition: opacity 0.2s;
}

.tag-chip i:hover {
  opacity: 0.7;
}

.tag-chip.purple {
  background-color: #d8b4fe;
  color: #4c1d95;
}

.tag-chip.yellow {
  background-color: #fef08a;
  color: #854d0e;
}

.tag-chip.blue {
  background-color: #93c5fd;
  color: #1e3a8a;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
  position: relative;
  gap: 8px;
  min-height: 44px;
  width: 100%;
  max-width: 300px;
}

.dropdown-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  min-width: 120px;
  font-style: italic;
  color: #999;
  font-family: poppins;
}

.dropdown-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px 0;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.dropdown-icon-btn:hover {
  color: var(--color-brand-primary);
}

.dropdown-icon-btn.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #999;
  border-radius: 4px;
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.15s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 15px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: poppins;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
  font-size: 0.95rem;
}

.dropdown-option:hover:not(.disabled) {
  background-color: #f5f5f5;
  padding-left: 18px;
}

.dropdown-option.selected {
  background-color: #e8f0ff;
  color: #0066cc;
  font-weight: 600;
}

.dropdown-option.selected i {
  color: #0066cc;
  font-weight: bold;
}

.dropdown-option.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background-color: #fafafa;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.option-text {
  flex: 1;
}

.dropdown-option i {
  font-size: 1rem;
  margin-left: 8px;
}

/* Scrollbar customizada */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #555;
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
