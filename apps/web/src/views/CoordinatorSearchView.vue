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

    <div class="results-header">
      <h3>RESULTADOS ({{ usuariosFiltrados.length }})</h3>
    </div>

    <div class="cards-grid">
      <div v-for="user in usuariosFiltrados" :key="user.id" class="user-card">
        
        <div class="card-avatar">
          <img :src="user.avatar || 'https://via.placeholder.com/150'" alt="Foto">
        </div>

        <div class="card-info">
          <h4 class="user-name">{{ user.nome }}</h4>
          <span class="user-id">ID: {{ user.registro }}</span>
          
          <p class="user-detail" v-if="user.type === 'student'">
            <i class="bi bi-mortarboard"></i> Aluno
          </p>
          <p class="user-detail" v-else>
            <i class="bi bi-briefcase"></i> Docente
          </p>
        </div>

        <div class="card-tags">
          <span class="tag tag-type" :class="user.type">
            {{ user.type === 'student' ? 'Aluno' : 'Docente' }}
          </span>

          <span class="tag tag-status" :class="getStatusClass(user)">
            {{ getStatusLabel(user) }}
          </span>
        </div>

      </div>
    </div>

    <div v-if="usuariosFiltrados.length === 0" class="empty-state">
      <i class="bi bi-emoji-frown"></i>
      <p>Nenhum usuário encontrado com esses filtros.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SearchBar from '../components/SearchBar.vue'

// --- ESTADO ---
const termoPesquisa = ref('');
const mostrarFiltros = ref(false);
const filtroTipo = ref('todos'); // 'todos', 'student', 'teacher'
const filtroStatus = ref('todos'); // 'todos', 'pendente', 'ok'

// --- MOCK DATA (Simulando o banco de dados misturado) ---
const todosUsuarios = [
  { 
    id: 1, type: 'student', nome: 'João da Silva', registro: 'RA123456', 
    temOrientador: false, avatar: 'https://i.pravatar.cc/150?u=1' 
  },
  { 
    id: 2, type: 'teacher', nome: 'Prof. Carlos Mendes', registro: 'MAT9876', 
    temVagas: true, avatar: 'https://i.pravatar.cc/150?u=2' 
  },
  { 
    id: 3, type: 'student', nome: 'Ana Beatriz Souza', registro: 'RA654321', 
    temOrientador: true, avatar: 'https://i.pravatar.cc/150?u=3' 
  },
  { 
    id: 4, type: 'teacher', nome: 'Profa. Lucia Lima', registro: 'MAT5555', 
    temVagas: false, avatar: 'https://i.pravatar.cc/150?u=4' 
  },
  { 
    id: 5, type: 'student', nome: 'Marcos Vinicius', registro: 'RA112233', 
    temOrientador: false, avatar: 'https://i.pravatar.cc/150?u=5' 
  },
  { 
    id: 6, type: 'student', nome: 'Fernanda Torres', registro: 'RA998877', 
    temOrientador: true, avatar: 'https://i.pravatar.cc/150?u=6' 
  },
];

// --- LÓGICA DE FILTRAGEM ---
const usuariosFiltrados = computed(() => {
  return todosUsuarios.filter(user => {
    
    // 1. Filtro de Texto (Nome ou Registro)
    const matchTexto = user.nome.toLowerCase().includes(termoPesquisa.value.toLowerCase()) || 
                       user.registro.toLowerCase().includes(termoPesquisa.value.toLowerCase());

    // 2. Filtro de Tipo (Aluno/Docente)
    const matchTipo = filtroTipo.value === 'todos' ? true : user.type === filtroTipo.value;

    // 3. Filtro de Status (Complexo)
    let matchStatus = true;
    if (filtroStatus.value !== 'todos') {
      if (user.type === 'student') {
        // Aluno Pendente = Sem Orientador
        matchStatus = filtroStatus.value === 'pendente' ? !user.temOrientador : user.temOrientador;
      } else {
        // Docente Pendente = Com Vagas (está "procurando" alunos)
        matchStatus = filtroStatus.value === 'pendente' ? user.temVagas : !user.temVagas;
      }
    }

    return matchTexto && matchTipo && matchStatus;
  });
});

// --- HELPER FUNCTIONS PARA UI ---
function getStatusLabel(user) {
  if (user.type === 'student') {
    return user.temOrientador ? 'Com Orientador' : 'Sem Orientador';
  }
  return user.temVagas ? 'Vagas Abertas' : 'Lotado';
}

function getStatusClass(user) {
  if (user.type === 'student') {
    return user.temOrientador ? 'status-ok' : 'status-warn';
  }
  return user.temVagas ? 'status-open' : 'status-closed';
}
</script>

<style scoped>
.search-page {
  padding: 2rem 4rem;
  background-color: #f4f4f4; /* Fundo cinza claro da imagem */
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

/* Dropdown de Filtros */
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
  margin-top: 1rem;
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

/* --- GRID DE RESULTADOS --- */
.results-header h3 {
  font-size: 1.1rem;
  font-style: italic; /* Igual a imagem */
  color: #333;
  margin-bottom: 1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
}

.user-card {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 1rem; /* Cards mais compactos como na imagem */
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.user-card:hover {
  border-color: #bbb;
}

.card-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #000; /* Fundo preto para combinar com imagem */
}

.card-info {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  color: #222;
}

.user-id {
  font-size: 0.8rem;
  color: #666;
  display: block;
  margin-bottom: 0.2rem;
}

.user-detail {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

/* Tags alinhadas a direita como na imagem */
.card-tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.tag {
  font-size: 0.7rem;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* CORES DAS TAGS */
.tag-type.student { background-color: #e3f2fd; color: #1565c0; }
.tag-type.teacher { background-color: #f3e5f5; color: #7b1fa2; }

.status-ok { background-color: #e8f5e9; color: #2e7d32; } /* Verde suave */
.status-warn { background-color: #fff3e0; color: #ef6c00; } /* Laranja suave */
.status-open { background-color: #e1f5fe; color: #0288d1; } /* Azul suave */
.status-closed { background-color: #ffebee; color: #c62828; } /* Vermelho suave */

/* Estado Vazio */
.empty-state {
  text-align: center;
  padding: 4rem;
  color: #999;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

@media (max-width: 768px) {
  .search-page { padding: 1rem; }
  .cards-grid { grid-template-columns: 1fr; }
  .search-container { flex-direction: column; }
  .filter-dropdown { position: static; width: 100%; margin-top: 1rem; }
}
</style>