<template>
  <div class="search-page">
    
    <div class="page-header">
      <h1>Gerenciamento de Usuários</h1>
      <p class="subtitle">Busque por alunos ou docentes para verificar status e pendências.</p>
    </div>

    <div class="search-container">
      <SearchBar v-model="searchQuery" />
    </div>

    <div class="filter-wrapper">
      <button class="btn-filter" @click="mostrarFiltros = !mostrarFiltros">
         Filtrar <i class="bi bi-funnel"></i>
      </button>
      
      <div v-if="mostrarFiltros" class="filter-dropdown">
        <div class="filter-group">
          <label>Tipo de Usuário:</label>
          <select v-model="filtroTipo">
            <option value="todos">Todos</option>
            <option value="student">Apenas Alunos</option>
            <option value="teacher">Apenas Docentes</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filtroStatus">
            <option value="todos">Qualquer Status</option>
            <option value="pendente">Sem Orientador / Com Vagas</option>
            <option value="ok">Com Orientador / Lotado</option>
          </select>
        </div>
      </div>
    </div>

    <div class="split-layout">
      
      <section class="column-section">
        <div class="column-header header-teacher">
          <h3><i class="bi bi-briefcase"></i> Docentes ({{ listaDocentes.length }})</h3>
        </div>

        <div class="cards-list">
          <div v-for="user in listaDocentes" :key="user.id" class="user-card card-teacher">
            <div class="card-avatar">
              <img :src="user.avatar || 'https://via.placeholder.com/150'" alt="Foto">
            </div>
            <div class="card-info">
              <h4 class="user-name">{{ user.nome }}</h4>
              <span class="user-id">ID: {{ user.registro }}</span>
            </div>
            <div class="card-tags">
              <span class="tag" :class="user.temVagas ? 'status-open' : 'status-closed'">
                {{ user.temVagas ? 'Vagas Abertas' : 'Lotado' }}
              </span>
            </div>
          </div>
          
          <div v-if="listaDocentes.length === 0" class="empty-column">
            <small>Nenhum docente encontrado.</small>
          </div>
        </div>
      </section>

      <div class="divider-vertical"></div>

      <section class="column-section">
        <div class="column-header header-student">
          <h3><i class="bi bi-mortarboard"></i> Alunos ({{ listaAlunos.length }})</h3>
        </div>

        <div class="cards-list">
          <div v-for="user in listaAlunos" :key="user.id" class="user-card card-student">
            <div class="card-avatar">
              <img :src="user.avatar || 'https://via.placeholder.com/150'" alt="Foto">
            </div>
            <div class="card-info">
              <h4 class="user-name">{{ user.nome }}</h4>
              <span class="user-id">RA: {{ user.registro }}</span>
            </div>
            <div class="card-tags">
              <span class="tag" :class="user.temOrientador ? 'status-ok' : 'status-warn'">
                {{ user.temOrientador ? 'Com Orientador' : 'Sem Orientador' }}
              </span>
            </div>
          </div>

          <div v-if="listaAlunos.length === 0" class="empty-column">
            <small>Nenhum aluno encontrado.</small>
          </div>
        </div>
      </section>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SearchBar from '../components/SearchBar.vue';

// --- ESTADO ---
const searchQuery = ref('');
const mostrarFiltros = ref(false);
const filtroTipo = ref('todos'); 
const filtroStatus = ref('todos');

// --- MOCK DATA ---
const todosUsuarios = [
  { id: 1, type: 'student', nome: 'João da Silva', registro: 'RA123456', temOrientador: false, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, type: 'teacher', nome: 'Prof. Carlos Mendes', registro: 'MAT9876', temVagas: true, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, type: 'student', nome: 'Ana Beatriz Souza', registro: 'RA654321', temOrientador: true, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, type: 'teacher', nome: 'Profa. Lucia Lima', registro: 'MAT5555', temVagas: false, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, type: 'student', nome: 'Marcos Vinicius', registro: 'RA112233', temOrientador: false, avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, type: 'student', nome: 'Fernanda Torres', registro: 'RA998877', temOrientador: true, avatar: 'https://i.pravatar.cc/150?u=6' },
];

// --- LÓGICA DE FILTRAGEM (Atualizada para suportar divisão) ---
const usuariosFiltradosGlobalmente = computed(() => {
  return todosUsuarios.filter(user => {
    
    // 1. Filtro Texto
    const termo = searchQuery.value.toLowerCase();
    const matchTexto = user.nome.toLowerCase().includes(termo) || 
                       user.registro.toLowerCase().includes(termo);

    // 2. Filtro Tipo (Ainda respeita o dropdown se o usuário quiser esconder uma coluna inteira)
    const matchTipo = filtroTipo.value === 'todos' ? true : user.type === filtroTipo.value;

    // 3. Filtro Status
    let matchStatus = true;
    if (filtroStatus.value !== 'todos') {
      if (user.type === 'student') {
        matchStatus = filtroStatus.value === 'pendente' ? !user.temOrientador : user.temOrientador;
      } else {
        matchStatus = filtroStatus.value === 'pendente' ? user.temVagas : !user.temVagas;
      }
    }

    return matchTexto && matchTipo && matchStatus;
  });
});

// Computed properties separadas para alimentar as duas colunas
const listaDocentes = computed(() => 
  usuariosFiltradosGlobalmente.value.filter(u => u.type === 'teacher')
);

const listaAlunos = computed(() => 
  usuariosFiltradosGlobalmente.value.filter(u => u.type === 'student')
);

</script>

<style scoped>
.search-page {
  padding: 2rem 4rem;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

/* --- BARRA DE PESQUISA E FILTROS --- */
.search-container {
  gap: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.filter-wrapper {
  display: flex;
  justify-content: flex-end;
  position: relative;
  margin-bottom: 2rem;
}

.btn-filter {
  background-color: var(--color-button-primary);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-family: poppins, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 250px;
  z-index: 10;
  margin-top: 0.5rem;
}

.filter-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #555;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* --- NOVO LAYOUT DIVIDIDO --- */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1px 1fr; /* Coluna | Linha | Coluna */
  gap: 2rem;
  align-items: start;
}

.divider-vertical {
  background-color: #ddd;
  height: 100%;
  min-height: 400px;
  width: 1px;
}

.column-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid transparent;
  display: inline-block;
}

/* Cores dos títulos das colunas */
.header-teacher h3 { border-color: #7b1fa2; color: #4a148c; }
.header-student h3 { border-color: #1565c0; color: #0d47a1; }

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* CARDS */
.user-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-left: 4px solid transparent; /* Indicador lateral */
  padding: 1rem; 
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 4px;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  border-color: #bbb;
}

/* Cores das bordas laterais */
.card-teacher { border-left-color: #7b1fa2; }
.card-student { border-left-color: #1565c0; }

.card-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
}

.card-info {
  flex: 1;
}

.user-name {
  font-size: 0.95rem;
  font-weight: bold;
  margin: 0;
  color: #222;
}

.user-id {
  font-size: 0.75rem;
  color: #666;
  display: block;
}

.card-tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tag {
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* TAG COLORS */
.status-ok { background-color: #e8f5e9; color: #2e7d32; }
.status-warn { background-color: #fff3e0; color: #ef6c00; }
.status-open { background-color: #e1f5fe; color: #0288d1; }
.status-closed { background-color: #ffebee; color: #c62828; }

.empty-column {
  text-align: center;
  color: #999;
  padding: 2rem;
  background: rgba(0,0,0,0.02);
  border-radius: 4px;
  font-style: italic;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .search-page { padding: 1.5rem; }
  .split-layout { grid-template-columns: 1fr; gap: 3rem; }
  .divider-vertical { display: none; }
  .filter-dropdown { position: static; width: 100%; margin-top: 1rem; }
}
</style>