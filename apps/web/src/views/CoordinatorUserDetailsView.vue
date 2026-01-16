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
            <span class="user-ra">{{ user.registro }}</span>
            
            <div class="tags-container">
              <span class="tag tag-purple">Lorem ipsum</span>
              <span class="tag tag-yellow">Dolor sit amet</span>
              <span class="tag tag-purple">Consectetur</span>
              <span class="tag tag-blue" v-if="user.type === 'teacher'">Área de Pesquisa</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-card content-card">
        
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

        <div v-if="activeTab === 'logs'" class="tab-content">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Data e hora de login</th>
                <th>Data e hora de logout</th>
                <th>Tempo de acesso</th>
                <th>Ação</th>
                <th>Opções</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in mockLogs" :key="index">
                <td>{{ log.login }}</td>
                <td>{{ log.logout }}</td>
                <td>{{ log.tempo }}</td>
                <td>{{ log.acao }}</td>
                <td class="actions-cell">
                  <a href="#">Visualizar</a>
                  <a href="#">Edit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'requests'" class="tab-content">
          <div class="empty-state">
            <p>Histórico de solicitações do aluno...</p>
            </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('logs');
const user = ref({});

// MOCK DATA: LOGS
const mockLogs = [
  { login: '12/10/2025 14:00', logout: '12/10/2025 15:30', tempo: '1h 30m', acao: 'Visualizou Perfil' },
  { login: '11/10/2025 09:00', logout: '11/10/2025 09:45', tempo: '45m', acao: 'Editou Tags' },
  { login: '10/10/2025 18:20', logout: '10/10/2025 19:00', tempo: '40m', acao: 'Buscou Orientador' },
  { login: '09/10/2025 10:00', logout: '09/10/2025 10:05', tempo: '05m', acao: 'Login Rápido' },
];

// SIMULAÇÃO DE BUSCA DO USUÁRIO PELO ID DA ROTA
onMounted(() => {
  const userId = route.params.id;
  // Aqui você faria o fetch no backend. Por enquanto, simulamos:
  console.log("Carregando usuário ID:", userId);
  
  user.value = {
    id: userId,
    nome: 'Yasmim Daiana', // Exemplo estático
    registro: 'RA123456',
    avatar: 'https://i.pravatar.cc/150?u=' + userId,
    type: 'student' // Mude para 'teacher' para testar a lógica condicional
  };
});
</script>

<style scoped>
.profile-page {
  background-color: #e0e0e0; /* Fundo cinza da imagem */
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
  padding: 1rem;
  background-color: #fff;
}

/* CARDS BRANCOS */
.profile-card {
  background: white;
  border: 1px solid #ccc;
  padding: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.profile-card.content-card{
  padding: 0.8rem 2rem;
}

/* HEADER DO PERFIL */
.profile-main {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-large img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #000;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.user-ra {
  font-weight: bold;
  color: #000;
  display: block;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
}

.tags-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* CORES DAS TAGS (Estilo da imagem) */
.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}
.tag-purple { background-color: #d1c4e9; color: #512da8; }
.tag-yellow { background-color: #fff9c4; color: #fbc02d; }
.tag-blue   { background-color: #bbdefb; color: #1976d2; }

/* ABAS */
.tabs-nav {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  font-family: poppins;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 0;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  font-family: poppins;
}

.tab-btn.active {
  color: var(--color-brand-primary, #004b86);
  border-bottom-color: var(--color-brand-primary, #004b86);
  font-family: poppins;
}

/* TABELA */
.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  text-align: left;
  padding: 1rem;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #000; /* Linha preta mais forte no header */
}

.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #555;
  font-size: 0.9rem;
}

/* Alternância de cores nas linhas (Zebrado) */
.custom-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.actions-cell a {
  margin-right: 10px;
  text-decoration: none;
  font-size: 0.85rem;
}

.actions-cell a:first-child { color: #1976d2; } /* Visualizar */
.actions-cell a:last-child { color: #1976d2; }  /* Edit */

.empty-state { padding: 2rem; text-align: center; color: #999; }
</style>