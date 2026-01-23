<template>
  <div class="page-wrapper">


      <main class="content-panel">
        
        <div v-if="currentView === 'home'">
          <section class="card-section themes-area">
            <h3>Temas de Pesquisa:</h3>
            <p class="instruction italic">Insira suas áreas de atuação:</p>

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

          <section class="card-section info-area">
            <h3>Informações Adicionais:</h3>
            <p class="instruction italic">Currículo Lattes:</p>
            <input 
              type="text" 
              v-model="professor.lattes" 
              placeholder="https://lattes.cnpq.br/..." 
              class="info-input"
            />
          </section>
        </div>

        <div v-if="currentView === 'requests'">
          <section class="card-section requests-area">
            <h3>Solicitações de Orientação Recebidas:</h3>

            <div v-if="receivedRequests.length > 0">
              <div v-for="req in receivedRequests" :key="req.id" class="request-item">
                <div class="student-info">
                  <div class="student-mini-card">
                    <img src="/src/assets/img/foto-perfil.svg" class="mini-avatar" />
                    <div class="student-details">
                      <p class="student-name">{{ req.studentName }}</p>
                      <span class="ra-badge">RA: {{ req.studentRa }}</span>
                    </div>
                  </div>
                </div>

                <div class="vertical-divider"></div>

                <div class="status-info">
                  <div class="status-row">
                    <p>Status:</p>
                    <span :class="['status-btn', getStatusClass(req.status)]">
                      {{ req.status }}
                    </span>
                  </div>
                  <p v-if="req.denialReason" class="status-note">{{ req.denialReason }}</p>
                </div>

                <div class="request-actions">
                  <button v-if="req.status === 'Pendente'" class="btn-accept" @click="acceptRequest(req.id)">
                    Aceitar
                  </button>
                  <button v-if="req.status === 'Pendente'" class="btn-deny" @click="openDenyModal(req.id)">
                    Recusar
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              Nenhuma solicitação de orientação recebida.
            </div>
          </section>
        </div>

        <div v-if="currentView === 'students'">
          <section class="card-section students-area">
            <h3>Alunos em Orientação:</h3>

            <div v-if="myStudents.length > 0">
              <div v-for="student in myStudents" :key="student.id" class="student-item">
                <div class="student-info">
                  <div class="student-mini-card">
                    <img src="/src/assets/img/foto-perfil.svg" class="mini-avatar" />
                    <div class="student-details">
                      <p class="student-name">{{ student.name }}</p>
                      <span class="ra-badge">RA: {{ student.ra }}</span>
                    </div>
                  </div>
                </div>

                <div class="vertical-divider"></div>

                <div class="student-themes">
                  <p class="theme-label">Temas:</p>
                  <div class="mini-tags">
                    <span v-for="tag in student.themes" :key="tag" class="mini-tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              Você não tem alunos em orientação no momento.
            </div>
          </section>
        </div>

      </main>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const professorId = route.params.id

const currentView = ref('home')
const newTag = ref('')
const tags = ref(['Inteligência Artificial', 'Machine Learning'])


const receivedRequests = ref([
  { id: 1, studentName: 'João da Silva', studentRa: 'RA123456', status: 'Pendente' },
  { id: 2, studentName: 'Maria Santos', studentRa: 'RA654321', status: 'Aceito' },
  { id: 3, studentName: 'Pedro Oliveira', studentRa: 'RA112233', status: 'Recusado', denialReason: 'Áreas de interesse incompatíveis' },
])

const myStudents = ref([
  { id: 1, name: 'Ana Beatriz Souza', ra: 'RA654321', themes: ['IA', 'NLP'] },
  { id: 2, name: 'Fernanda Torres', ra: 'RA998877', themes: ['Machine Learning', 'Visão Computacional'] },
])

const getTagColor = (index) => {
  const colors = ['purple', 'yellow', 'blue']
  return colors[index % colors.length]
}

const addTag = () => {
  if (newTag.value.trim()) {
    tags.value.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}

const getStatusClass = (status) => {
  if (status === 'Aceito') return 'success'
  if (status === 'Recusado') return 'danger'
  return 'pending'
}

const acceptRequest = (requestId) => {
  const req = receivedRequests.value.find(r => r.id === requestId)
  if (req) {
    req.status = 'Aceito'
  }
}

const openDenyModal = (requestId) => {
  console.log('Abrir modal de recusa para:', requestId)
}

onMounted(() => {
  // Dados inicializados
})
</script>

<style scoped>
/* ESTRUTURA BÁSICA */
.page-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-layout {
  display: flex;
  width: 100%;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* SIDEBAR DO PROFESSOR */
.professor-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem 1rem;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-brand-primary);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.professor-identity {
  text-align: center;
}

.professor-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.professor-id {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #666;
}

/* MENU DA SIDEBAR */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-menu {
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
}

.btn-menu:hover {
  background-color: #f9f9f9;
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
}

.btn-menu.active-btn {
  background-color: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
}

/* CONTEÚDO PRINCIPAL */
.content-panel {
  flex: 1;
}

.card-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.instruction {
  font-size: 0.85rem;
  color: #666;
  margin: 0.5rem 0 1rem 0;
  font-style: italic;
}

/* CONTROLE DE TAGS */
.tags-control-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.input-wrapper {
  display: flex;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 5px;
  width: 100%;
  max-width: 300px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  padding: 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
}

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
  font-size: 0.75rem;
}

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

/* INPUT DE INFORMAÇÕES */
.info-input {
  width: 100%;
  max-width: 500px;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
}

/* ITEMS DE SOLICITAÇÕES E ALUNOS */
.request-item,
.student-item {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.student-info {
  flex: 0 0 auto;
}

.student-mini-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mini-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ddd;
  object-fit: cover;
}

.student-name {
  font-weight: 700;
  margin: 0;
  font-size: 1rem;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ra-badge {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  font-weight: 600;
}

/* DIVISOR VERTICAL */
.vertical-divider {
  width: 1px;
  height: 60px;
  background-color: #ccc;
  margin: 0 1.5rem;
  flex-shrink: 0;
}

/* STATUS INFO */
.status-info {
  flex: 1;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.status-row p {
  font-style: italic;
  font-size: 0.95rem;
  margin: 0;
  min-width: 60px;
}

.status-btn {
  width: fit-content;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-style: italic;
  color: white;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-radius: 4px;
}

.status-btn.pending {
  background-color: var(--color-status-warning);
}

.status-btn.success {
  background-color: var(--color-status-success);
}

.status-btn.danger {
  background-color: var(--color-status-danger);
}

.status-note {
  font-size: 0.8rem;
  color: #666;
  margin: 0.3rem 0 0 0;
  font-style: italic;
}

/* AÇÕES DE SOLICITAÇÃO */
.request-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-accept {
  background-color: var(--color-status-success);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-deny {
  background-color: var(--color-status-danger);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-accept:hover,
.btn-deny:hover {
  opacity: 0.8;
}

/* TEMAS DO ALUNO */
.student-themes {
  flex: 1;
}

.theme-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.mini-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.mini-tag {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 2px 8px;
  font-size: 0.7rem;
  border-radius: 12px;
  font-weight: 600;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-style: italic;
  font-size: 0.9rem;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .professor-sidebar {
    width: 100%;
  }

  .request-item,
  .student-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .vertical-divider {
    display: none;
  }
}
</style>
