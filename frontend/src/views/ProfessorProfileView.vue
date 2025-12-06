<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading-message">
      Carregando dados do docente...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="docente" class="profile-content">
      <div class="profile-header">
        <img src="/src/assets/img/foto-perfil.svg" alt="foto de perfil" />
        <div class="profile-info">
          <h1>{{ docente.name }}</h1>
          <p>{{ docente.email }}</p>
          <a :href="docente.lattes" target="_blank">Ver Currículo Lattes</a>
        </div>
      </div>

      <div class="profile-body">
        <h3>Temas de Interesse:</h3>
        <div class="tags-container">
          <span class="tag" v-for="tag in docente.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importa as ferramentas do Vue que precisamos
import { ref, onMounted } from 'vue';
// Importa o hook do Vue Router para ler a URL
import { useRoute } from 'vue-router';
// (No futuro, importaremos a API real: import api from '@/services/api')

// --- 1. DEFINIÇÃO DOS ESTADOS ---
// 'ref(null)' é a "caixa" que vai guardar os dados do docente
const docente = ref(null); 
// 'ref(true)' para mostrar a mensagem "Carregando..."
const isLoading = ref(true);
// 'ref(null)' para guardar mensagens de erro
const error = ref(null);

// --- 2. BUSCANDO O ID DA URL ---
// Pega a rota atual
const route = useRoute(); 
// Pega o parâmetro ':id' que definimos no router/index.js
const docenteId = route.params.id; 

// --- 3. FUNÇÃO QUE RODA QUANDO A PÁGINA É CRIADA ---
onMounted(async () => {
  try {
    // --- SIMULAÇÃO DE UMA CHAMADA DE API (para você testar) ---
    // (O back-end do seu colega fará isso de verdade)
    const mockDatabase = {
      '1': { id: 1, name: "Prof. Mock 1 Detalhado", email: "mock1@unicamp.br", lattes: "http://lattes...", tags: ['IA', 'Redes Neurais'] },
      '2': { id: 2, name: "Prof. Mock 2 Detalhado", email: "mock2@unicamp.br", lattes: "http://lattes...", tags: ['Banco de Dados', 'Sistemas'] },
      '3': { id: 3, name: "Prof. Mock 3 Detalhado", email: "mock3@unicamp.br", lattes: "http://lattes...", tags: ['Engenharia de Software'] },
    };
    
    // Simula a espera da rede (1 segundo)
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const data = mockDatabase[docenteId];
    // --- FIM DA SIMULAÇÃO ---

    // (Quando a API real estiver pronta, você vai trocar o bloco acima por:)
    // const response = await api.getDocenteById(docenteId);
    // const data = response.data;
    
    if (data) {
      // Se encontrou, preenche a "caixa" com os dados
      docente.value = data; 
    } else {
      // Se não encontrou, joga um erro
      throw new Error('Docente não encontrado');
    }
  } catch (err) {
    // Se algo deu errado (API falhou ou não encontrou), preenche o erro
    error.value = err.message;
  } finally {
    // Independentemente de sucesso ou erro, para de carregar
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* CSS para a PÁGINA de Perfil. 
  (Você pode reusar e adaptar as classes do seu card aqui)
*/
.profile-container {
  padding: 2rem;
  background-color: var(--white-color, #fff);
  max-width: 68rem;
  margin: 0 auto; /* Centraliza a página de perfil */
}

.loading-message, .error-message {
  font-size: 1.2rem;
  color: var(--color-text-muted, #6c757d);
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: var(--color-status-danger, #DC3545);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 2px solid var(--color-border-default, #ccc);
  padding-bottom: 1.5rem;
}

.profile-header img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid var(--color-brand-primary, #065F8B);
}

.profile-info h1 {
  margin: 0;
  color: var(--color-text-primary, #1E1E1E);
}

.profile-info p {
  margin: 0.25rem 0;
  color: var(--color-text-muted, #6c757d);
}

.profile-info a {
  color: var(--color-brand-primary, #065F8B);
  text-decoration: none;
  font-weight: bold;
}

.profile-body {
  padding-top: 1.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

/* Reutilizando o estilo de 'tag' que você criou */
.tag {
  width: fit-content;
  height: 32px;
  border-radius: 1rem;
  font-weight: bold;
  font-style: italic;
  font-size: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-tag1, #eee);
  color: var(--color-tag1-darker, #333);
  border: 1px solid var(--color-tag1-darker, #333);
}
</style>