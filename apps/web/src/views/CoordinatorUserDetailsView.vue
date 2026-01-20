<template>
  <div class="profile-page">
    <div class="container">
      
      <div class="profile-card header-card">
        <div class="profile-main">
          <div class="avatar-large">
            <img :src="user.avatar || 'https://via.placeholder.com/150'" alt="Avatar">
          </div>
          <div class="profile-info">
            <h2>{{ user.nome }}</h2>
            <span class="user-ra">
              {{ user.type === 'student' ? 'RA: ' : 'ID: ' }} {{ user.registro }}
            </span>
            <span class="user-type-badge" :class="user.type">
              {{ user.type === 'student' ? 'Discente' : 'Docente' }}
            </span>
            
            <div class="tags-container">
              <span class="tag tag-purple">Inteligência Artificial</span>
              <span class="tag tag-yellow">Web Development</span>
              <span class="tag tag-blue" v-if="user.type === 'teacher'">Área de Pesquisa</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-card content-card">
        
        <div class="tabs-header">
          <div class="tabs-nav">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'logs' }" 
              @click="activeTab = 'logs'">
              Histórico de logs
            </button>
            
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'requests' }" 
              @click="activeTab = 'requests'">
              Histórico de solicitações
            </button>

            <button 
              v-if="user.type === 'teacher'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'stats' }" 
              @click="activeTab = 'stats'">
              Estatísticas Gerais
            </button>
          </div>

          <div class="semester-filter">
            <label>Filtrar por semestre:</label>
            <select v-model="semestreSelecionado" @change="atualizarDados">
              <option value="2025-1">1º Semestre 2025 (Atual)</option>
              <option value="2024-2">2º Semestre 2024</option>
              <option value="2024-1">1º Semestre 2024</option>
            </select>
          </div>
        </div>

        <div v-if="activeTab === 'logs'" class="tab-content">
          <div class="tab-header-info">
            <p>Exibindo logs de acesso referentes a <strong>{{ labelSemestre }}</strong></p>
          </div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Data/Hora Login</th>
                <th>Data/Hora Logout</th>
                <th>Tempo</th>
                <th>Ação Principal</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in logsFiltrados" :key="index">
                <td>{{ log.login }}</td>
                <td>{{ log.logout }}</td>
                <td>{{ log.tempo }}</td>
                <td>{{ log.acao }}</td>
                <td class="actions-cell">
                  <a href="#">Ver</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="logsFiltrados.length === 0" class="empty-state">
            Nenhum registro encontrado neste semestre.
          </div>
        </div>

        <div v-if="activeTab === 'requests'" class="tab-content">
          <div class="tab-header-info">
            <p>Histórico de interações referentes a <strong>{{ labelSemestre }}</strong></p>
          </div>
          <table class="custom-table" v-if="solicitacoesFiltradas.length > 0">
            <thead>
              <tr>
                <th>Data Envio</th>
                <th>{{ user.type === 'student' ? 'Docente' : 'Aluno' }}</th>
                <th>Status</th>
                <th>Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sol, index) in solicitacoesFiltradas" :key="index">
                <td>{{ sol.data }}</td>
                <td>{{ sol.envolvido }}</td>
                <td>
                  <span class="status-badge" :class="sol.statusClass">{{ sol.status }}</span>
                </td>
                <td>{{ sol.atualizacao }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">
            Nenhuma solicitação encontrada neste semestre.
          </div>
        </div>

        <div v-if="activeTab === 'stats' && user.type === 'teacher'" class="tab-content">
          <div class="stats-container">
            <div class="stat-card">
              <h3>Solicitações Recebidas</h3>
              <div class="stat-value">{{ estatisticas.recebidas }}</div>
              <small>Em {{ labelSemestre }}</small>
            </div>
            <div class="stat-card">
              <h3>Taxa de Aceite</h3>
              <div class="stat-value">{{ estatisticas.taxaAceite }}%</div>
              <small>{{ estatisticas.aceitas }} aceitas / {{ estatisticas.recusadas }} recusadas</small>
            </div>
            <div class="stat-card">
              <h3>Vagas Preenchidas</h3>
              <div class="stat-value">{{ estatisticas.vagasOcupadas }}/{{ estatisticas.vagasTotais }}</div>
              <progress :value="estatisticas.vagasOcupadas" :max="estatisticas.vagasTotais"></progress>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('logs');
const semestreSelecionado = ref('2025-1');
const user = ref({}); // Será preenchido com dados mockados

// MOCK DATA - Simulando banco de dados
const dbLogs = [
  { semestre: '2025-1', login: '12/02/2025 14:00', logout: '12/02/2025 15:30', tempo: '1h 30m', acao: 'Visualizou Perfil' },
  { semestre: '2025-1', login: '10/02/2025 09:00', logout: '10/02/2025 09:45', tempo: '45m', acao: 'Editou Tags' },
  { semestre: '2024-2', login: '15/11/2024 10:00', logout: '15/11/2024 10:20', tempo: '20m', acao: 'Respondeu Solicitação' },
];

const dbSolicitacoes = [
  { semestre: '2025-1', data: '12/02/2025', envolvido: 'Maria Silva', status: 'Pendente', statusClass: 'pending', atualizacao: '-' },
  { semestre: '2024-2', data: '10/11/2024', envolvido: 'João Souza', status: 'Aceito', statusClass: 'accepted', atualizacao: '15/11/2024' },
  { semestre: '2024-2', data: '01/10/2024', envolvido: 'Pedro Alvares', status: 'Recusado', statusClass: 'rejected', atualizacao: '05/10/2024' },
];

const dbEstatisticas = {
  '2025-1': { recebidas: 5, aceitas: 1, recusadas: 0, taxaAceite: 20, vagasOcupadas: 1, vagasTotais: 5 },
  '2024-2': { recebidas: 15, aceitas: 5, recusadas: 10, taxaAceite: 33, vagasOcupadas: 5, vagasTotais: 5 },
  '2024-1': { recebidas: 8, aceitas: 4, recusadas: 4, taxaAceite: 50, vagasOcupadas: 4, vagasTotais: 6 },
};

// --- COMPUTEDS (Filtragem) ---

const labelSemestre = computed(() => {
  const map = { '2025-1': '1º Sem/2025', '2024-2': '2º Sem/2024', '2024-1': '1º Sem/2024' };
  return map[semestreSelecionado.value];
});

const logsFiltrados = computed(() => {
  return dbLogs.filter(log => log.semestre === semestreSelecionado.value);
});

const solicitacoesFiltradas = computed(() => {
  return dbSolicitacoes.filter(sol => sol.semestre === semestreSelecionado.value);
});

const estatisticas = computed(() => {
  return dbEstatisticas[semestreSelecionado.value] || { recebidas: 0, taxaAceite: 0, vagasOcupadas: 0 };
});

function atualizarDados() {
  console.log("Filtrando dados para:", semestreSelecionado.value);
  // Em um cenário real, aqui você faria um novo fetch na API passando o semestre
}

onMounted(() => {
  const userId = route.params.id;
  
  // SIMULAÇÃO: Lógica para decidir se é Docente ou Aluno baseado no ID (ou mock fixo)
  // Para testar Docente, use um ID par. Para Aluno, ímpar.
  const isTeacher = userId % 2 === 0; 

  user.value = {
    id: userId,
    nome: isTeacher ? 'Prof. Carlos Mendes' : 'Yasmim Daiana',
    registro: isTeacher ? '123456' : '166939',
    type: isTeacher ? 'teacher' : 'student',
    avatar: 'https://i.pravatar.cc/150?u=' + userId
  };
});
</script>

<style scoped>
.profile-page {
  background-color: #f4f4f4;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* HEADER DO PERFIL */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-large img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.user-ra {
  font-weight: 600;
  color: #666;
  display: block;
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.user-type-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.user-type-badge.student { background: #e3f2fd; color: #1565c0; }
.user-type-badge.teacher { background: #f3e5f5; color: #7b1fa2; }

.tags-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}
.tag-purple { background-color: #d1c4e9; color: #512da8; }
.tag-yellow { background-color: #fff9c4; color: #fbc02d; }
.tag-blue   { background-color: #bbdefb; color: #1976d2; }

/* FILTRO DE SEMESTRE */
.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.semester-filter {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-family: poppins, sans-serif;
}
.semester-filter label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
}
.semester-filter select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
  cursor: pointer;
  font-family: poppins, sans-serif;
}

/* ABAS */
.tabs-nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
  font-family: poppins, sans-serif;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  font-family: poppins, sans-serif;
}

.tab-btn:hover { color: #333; }

.tab-btn.active {
  color: var(--color-brand-primary, #004b86);
  border-bottom-color: var(--color-brand-primary, #004b86);
  font-weight: 600;
}

/* CONTEÚDO DAS ABAS */
.tab-header-info {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  text-align: left;
  padding: 1rem;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #eee;
}

.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #555;
  font-size: 0.9rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-badge.pending { background: #fff3e0; color: #ef6c00; }
.status-badge.accepted { background: #e8f5e9; color: #2e7d32; }
.status-badge.rejected { background: #ffebee; color: #c62828; }

.actions-cell a { color: #1976d2; text-decoration: none; font-weight: 500; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-style: italic;
}

/* ESTATÍSTICAS CARDS */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #eee;
}

.stat-card h3 { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: bold; color: #004b86; margin-bottom: 0.5rem; }
.stat-card small { color: #888; font-size: 0.8rem; }

progress { width: 100%; height: 8px; border-radius: 4px; }
</style>