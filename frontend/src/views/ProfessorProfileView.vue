<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading-message">Carregando dados do docente...</div>

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

        <button class="btn-send-request" @click="abrirModal">Enviar Solicitação</button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-card">
        <h3>Confirmar Envio</h3>
        <p>
          Você deseja enviar uma solicitação de orientação para <strong>{{ docente?.name }}</strong
          >?
        </p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="fecharModal" :disabled="isSending">
            Cancelar Envio
          </button>

          <button class="btn-confirm" @click="confirmarEnvio" :disabled="isSending">
            {{ isSending ? 'Enviando...' : 'Confirmar Solicitação' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const docente = ref(null)
const isLoading = ref(true)
const error = ref(null)
const route = useRoute()
const docenteId = route.params.id

const authUser = { id: 5, name: 'Aluno Exemplo' }

// --- LÓGICA DO MODAL E ENVIO ---
const showModal = ref(false)
const isSending = ref(false)

const abrirModal = () => {
  showModal.value = true
}

const fecharModal = () => {
  // Só fecha se NÃO estiver enviando (para evitar fechar no meio do loading)
  if (!isSending.value) {
    showModal.value = false
  }
}

const confirmarEnvio = async () => {
  isSending.value = true // 1. Começa o Loading

  try {
    // === SIMULAÇÃO BACK-END ===
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // === 2. FECHA O MODAL PRIMEIRO (SUCESSO) ===
    // Forçamos o fechamento direto aqui, ignorando a função fecharModal
    showModal.value = false

    // === 3. MOSTRA O ALERTA COM PEQUENO DELAY ===
    // O setTimeout permite que o modal suma visualmente antes do alerta aparecer
    setTimeout(() => {
      Swal.fire({
        title: 'Sucesso!',
        text: `Solicitação enviada para ${docente.value.name}.`,
        icon: 'success',
        confirmButtonColor: 'var(--color-status-success)',
        timer: 3000,
      })
    }, 200) // 200ms de espera
  } catch (err) {
    console.error(err)

    showModal.value = false

    setTimeout(() => {
      Swal.fire({
        title: 'Erro!',
        text: 'Não foi possível enviar a solicitação. Tente novamente.',
        icon: 'error',
        confirmButtonColor: 'var(--color-status-danger)',
      })
    }, 200)
  } finally {
    isSending.value = false
  }
}

onMounted(async () => {
  try {
    const mockDatabase = {
      1: {
        id: 1,
        name: 'Prof. Mock 1 Detalhado',
        email: 'mock1@unicamp.br',
        lattes: 'http://lattes...',
        tags: ['IA', 'Redes Neurais'],
      },
      2: {
        id: 2,
        name: 'Prof. Mock 2 Detalhado',
        email: 'mock2@unicamp.br',
        lattes: 'http://lattes...',
        tags: ['Banco de Dados', 'Sistemas'],
      },
      3: {
        id: 3,
        name: 'Prof. Mock 3 Detalhado',
        email: 'mock3@unicamp.br',
        lattes: 'http://lattes...',
        tags: ['Engenharia de Software'],
      },
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const data = mockDatabase[docenteId]

    if (data) {
      docente.value = data
    } else {
      throw new Error('Docente não encontrado')
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* SEUS ESTILOS ORIGINAIS MANTIDOS */

.profile-container {
  padding: 2rem;
  background-color: var(--white-color, #fff);
  max-width: 68rem;
  margin: 0 auto;
}

.loading-message,
.error-message {
  font-size: 1.2rem;
  color: var(--color-text-muted, #6c757d);
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: var(--color-status-danger, #dc3545);
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
  border: 2px solid var(--color-brand-primary, #065f8b);
}

.profile-info h1 {
  margin: 0;
  color: var(--color-text-primary, #1e1e1e);
}

.profile-info p {
  margin: 0.25rem 0;
  color: var(--color-text-muted, #6c757d);
}

.profile-info a {
  color: var(--color-brand-primary, #065f8b);
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

/* BOTÃO DE ENVIAR SOLICITAÇÃO */
.btn-send-request {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 11.813rem;
  height: 2.625rem;
  flex-shrink: 0;
  background-color: var(--color-button-primary);
  border: 2px solid #0e4392;
  color: #fff;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  font-style: italic;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-send-request:hover {
  opacity: 0.8;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.modal-card h3 {
  margin-top: 0;
  color: var(--color-text-primary, #333);
}

.modal-card p {
  color: var(--color-text-muted, #666);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-cancel {
  background-color: var(--color-status-danger);
  border: 2px solid #971b27;
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-style: italic;
}

.btn-confirm {
  background-color: var(--color-status-success);
  border: 2px solid #137c2c;
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-style: italic;
  transition: opacity 0.2s ease;
  min-width: 100px;
}

.btn-cancel:hover:not(:disabled),
.btn-confirm:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-cancel:disabled,
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
