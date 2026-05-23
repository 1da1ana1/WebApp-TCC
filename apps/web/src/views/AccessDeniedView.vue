<template>
  <div class="access-denied-container">
    <div class="access-denied-card">
      <i class="bi bi-lock-fill access-denied-icon"></i>
      <h1>Acesso Negado</h1>
      <p class="error-message">Você não tem permissão para acessar esta página.</p>
      
      <div class="access-denied-details">
        <p v-if="user">
          <strong>Usuário:</strong> {{ user.name }}<br>
          <strong>Perfil:</strong> {{ getUserType() }}
        </p>
        <p v-else>
          Você não está autenticado. Por favor, faça login.
        </p>
      </div>

      <div class="access-denied-actions">
        <router-link to="/dev-login" class="btn-primary">
          <i class="bi bi-box-arrow-in-right"></i> Ir para Login
        </router-link>
        <router-link to="/" class="btn-secondary">
          <i class="bi bi-house-fill"></i> Voltar ao Início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const getUserType = () => {
  if (!user.value) return 'Não identificado'
  
  const types = {
    student: 'Aluno',
    teacher: 'Professor',
    coordinator: 'Coordenador'
  }
  return types[user.value.type] || 'Tipo desconhecido'
}
</script>

<style scoped>
.access-denied-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.access-denied-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.access-denied-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 1rem;
  display: block;
}

.access-denied-card h1 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.error-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.access-denied-details {
  background: #f8f9fa;
  border-left: 4px solid #dc3545;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  text-align: left;
}

.access-denied-details p {
  margin: 0;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.8;
}

.access-denied-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

@media (max-width: 600px) {
  .access-denied-card {
    padding: 2rem 1.5rem;
  }

  .access-denied-icon {
    font-size: 3rem;
  }

  .access-denied-card h1 {
    font-size: 1.5rem;
  }

  .access-denied-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
