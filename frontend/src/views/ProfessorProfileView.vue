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
        
        <div class="interests-content">
            <h3>Temas de Interesse:</h3>
            <div class="tags-container">
            <span class="tag" v-for="tag in docente.tags" :key="tag">{{ tag }}</span>
            </div>
        </div>

        <button class="btn-send-request" @click="enviarSolicitacao">
            Enviar Solicitação
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const docente = ref(null); 
const isLoading = ref(true);
const error = ref(null);
const route = useRoute(); 
const docenteId = route.params.id; 

const enviarSolicitacao = () => {
    alert(`Solicitação enviada para ${docente.value.name}!`);
};

onMounted(async () => {
  try {
    const mockDatabase = {
      '1': { id: 1, name: "Prof. Mock 1 Detalhado", email: "mock1@unicamp.br", lattes: "http://lattes...", tags: ['IA', 'Redes Neurais'] },
      '2': { id: 2, name: "Prof. Mock 2 Detalhado", email: "mock2@unicamp.br", lattes: "http://lattes...", tags: ['Banco de Dados', 'Sistemas'] },
      '3': { id: 3, name: "Prof. Mock 3 Detalhado", email: "mock3@unicamp.br", lattes: "http://lattes...", tags: ['Engenharia de Software'] },
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const data = mockDatabase[docenteId];
    
    if (data) {
      docente.value = data; 
    } else {
      throw new Error('Docente não encontrado');
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  background-color: var(--white-color, #fff);
  max-width: 68rem;
  margin: 0 auto; 
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.interests-content {
    flex: 1;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

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

.btn-send-request {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  width: 11.813rem;
  height: 2.625rem;
  
  flex-shrink: 0; 
  
  background-color: var(--color-status-neutral, #eee);
  color: var(--color-text-neutral, #333);
  border: 2px solid var(--color-border-default, #ccc);
  border-radius: 8px;
  
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-send-request:hover {
  opacity: 0.8;
}
</style>