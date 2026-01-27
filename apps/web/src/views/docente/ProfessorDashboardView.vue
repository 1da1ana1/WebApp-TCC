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
                  <button 
                    class="btn-menu" 
                    :class="{ 'active-btn': currentView === 'home' }"
                    @click="currentView = 'home'"
                  >
                    Início <i class="bi bi-chevron-right"></i>
                  </button>
                </li>

                <li>
                  <button 
                    class="btn-menu" 
                    :class="{ 'active-btn': currentView === 'requests' }"
                    @click="currentView = 'requests'"
                  >
                    Minhas solicitações <i class="bi bi-chevron-right"></i>
                  </button>
                </li>

                <li>
                  <button 
                    class="btn-menu" 
                    :class="{ 'active-btn': currentView === 'history' }"
                    @click="currentView = 'history'"
                  >
                    Histórico de solicitações <i class="bi bi-chevron-right"></i>
                  </button>
                </li>

                <li>
                  <button 
                    class="btn-menu" 
                    :class="{ 'active-btn': currentView === 'guidances' }"
                    @click="currentView = 'guidances'"
                  >
                    Orientações em vigência <i class="bi bi-chevron-right"></i>
                  </button>
                </li>

                <li>
                  <button 
                    class="btn-menu" 
                    :class="{ 'active-btn': currentView === 'stats' }"
                    @click="currentView = 'stats'"
                  >
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

          <section class="card-section vacancies-area">
            <h3>Relação de vagas:</h3>
            
            <div class="vacancies-layout">
              <div class="vacancies-status">
                <div class="vacancy-box green">
                  <span>VAGAS DEFINIDAS PELA COORDENAÇÃO: {{ vacancies.total }}</span>
                </div>
                
                <div class="vacancy-box yellow">
                  <span>VAGAS RESTANTES: {{ vacancies.total - vacancies.filled }}</span>
                </div>

                <div class="vacancy-box red">
                  <span>VAGAS PREENCHIDAS: {{ vacancies.filled }}</span>
                </div>
              </div>

              <div class="contest-card">
                <button class="btn-contest" @click="openContestModal">Contestar vagas</button>
                <p class="contest-dates">
                  Período de contestação:<br>
                  01/01/2025 - 15/01/2025
                </p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'requests'">
          <section class="card-section">
            <h3>Solicitações Recebidas:</h3>
            <div class="empty-state">
              <p>Nenhuma solicitação pendente no momento.</p>
            </div>
          </section>
        </div>

        <div v-else-if="currentView === 'history'">
           <RequestHistoryTable 
             title="Histórico de solicitações"
             :data="historyData"
           />
        </div>

        <div v-else-if="currentView === 'guidances'">
          <section class="card-section">
            <h3>Alunos em orientação:</h3>
            <p class="instruction">Semestre 1/2025</p>
            <ul>
                <li>João da Silva - TCC 1</li>
            </ul>
          </section>
        </div>

        <div v-else-if="currentView === 'stats'">
          <section class="card-section stats-area">
            <h3>Estatísticas Gerais</h3>
            
            <div class="stats-grid">
              <div class="stat-card">
                <h4>Total de Solicitações Recebidas:</h4>
                <div class="stat-number">12</div>
              </div>
              
              <div class="stat-card">
                <h4>Total de Solicitações Recusadas:</h4>
                <div class="stat-number">8</div>
              </div>

              <div class="stat-card">
                <h4>Total de Orientações Concluídas:</h4>
                <div class="stat-number">4</div>
              </div>

              <div class="stat-card">
                <h4>Taxa de aceite</h4>
                <div class="stat-number">80%</div>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CronogramSchedule from '@/components/CronogramSchedule.vue'
import RequestHistoryTable from '@/components/RequestHistoryTable.vue'
import Swal from 'sweetalert2'

// --- ESTADO DA VIEW ---
const currentView = ref('home')

// --- DADOS DO DOCENTE ---
const teacher = ref({
  name: 'Prof. Dr. Lorem Ipsum',
  id: '123456',
  photo: '/src/assets/img/foto-perfil.svg',
})

// --- VAGAS ---
const vacancies = ref({
  total: 5,
  filled: 0
})

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

// --- HISTÓRICO ---
const historyData = ref([
  { id: 1, name: 'Aluno Exemplo', ra: '123123', status: 'Aceita', date: '10/02/2025' }
])

// --- AÇÕES ---
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
/* --- LAYOUT GLOBAL (Herdado do Aluno para consistência) --- */
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
.teacher-sidebar {
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

.avatar-circle img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #333;
  background-color: #000;
}

.teacher-name {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
}

.teacher-id {
  font-size: 0.89rem;
  font-weight: 800;
}

/* --- MENU LATERAL (Estilo Botão Azul Escuro) --- */
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.btn-menu {
  width: 100%;
  background-color: #005b8e; /* Azul mais escuro conforme imagem do docente */
  color: white;
  border: none;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-style: italic;
  font-size: 0.85rem;
  height: 60px; /* Altura ajustada */
  border-bottom: 1px solid rgba(255,255,255,0.1);
  transition: filter 0.3s ease;
  font-family: poppins;
}

.btn-menu:hover {
  filter: brightness(1.2);
}

.btn-menu.active-btn {
  background-color: #004b75; /* Tom mais escuro para ativo */
  font-weight: bold;
}

/* --- ÁREA DE CONTEÚDO --- */
.content-panel {
  flex: 1;
}

.card-section {
  background: white;
  border: 1px solid #ccc;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.card-section h3 {
  margin-top: 0;
  font-weight: 400;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* --- ÁREA DE VAGAS (Estilo Específico Docente) --- */
.vacancies-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.vacancies-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vacancy-box {
  border-radius: 20px;
  padding: 12px 20px;
  font-weight: bold;
  font-style: italic;
  font-size: 0.85rem;
  text-transform: uppercase;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  color: #000;
}

.vacancy-box.green { background-color: #96f2b3; }
.vacancy-box.yellow { background-color: #fff9c4; }
.vacancy-box.red { background-color: #ffcccb; }

/* Card de Contestação */
.contest-card {
  border: 1px solid #000;
  padding: 1.5rem;
  text-align: center;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.btn-contest {
  background-color: #ffcc00; /* Amarelo ouro */
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  font-style: italic;
  font-family: poppins;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.contest-dates {
  font-size: 0.8rem;
  font-style: italic;
  font-weight: bold;
  margin: 0;
}

/* --- TAGS (Reutilizado) --- */
.tags-control-container { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.input-wrapper { display: flex; border: 1px solid #999; border-radius: 4px; padding: 5px; width: 100%; max-width: 300px; }
.input-wrapper input { border: none; outline: none; flex: 1; padding: 5px; font-style: italic; font-family:poppins; }
.add-tag-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.tags-display { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { padding: 5px 15px; border-radius: 15px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag.purple { background-color: #d8b4fe; color: #4c1d95; }
.tag.yellow { background-color: #fef08a; color: #854d0e; }
.tag.blue { background-color: #93c5fd; color: #1e3a8a; }

/* --- ESTATÍSTICAS (Cards Verdes) --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card h4 {
  font-style: italic;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  min-height: 40px; /* Alinhar alturas */
}

.stat-number {
  background-color: #96f2b3; /* Verde claro igual imagem */
  width: 100%;
  height: 120px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: 800;
  color: #000;
}

@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .teacher-sidebar { width: 100%; }
  .vacancies-layout { flex-direction: column; }
  .contest-card { width: 100%; }
}
</style>