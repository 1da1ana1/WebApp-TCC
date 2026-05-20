<template>
  <div class="login-container">
    <div class="login-box">
      <h1>TCC Management System</h1>
      <p class="subtitle">Sistema de Gestão de Trabalhos de Conclusão de Curso</p>

      <!-- Quick Login Buttons -->
      <div class="quick-login-section">
        <p class="quick-login-title">Login Rápido (Desenvolvimento)</p>
        <div class="quick-login-buttons">
          <button 
            type="button" 
            @click="quickLoginStudent" 
            class="btn-quick-login btn-student"
            :disabled="loading"
          >
            <i class="bi bi-person-fill"></i> Aluno
          </button>
          <button 
            type="button" 
            @click="quickLoginTeacher" 
            class="btn-quick-login btn-teacher"
            :disabled="loading"
          >
            <i class="bi bi-book-fill"></i> Professor
          </button>
          <button
            type="button"
            @click="quickLoginCoordinator"
            class="btn-quick-login btn-coordinator"
            :disabled="loading"
          >
            <i class="bi bi-briefcase-fill"></i> Coordenador
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Sua senha"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const quickLoginStudent = async () => {
  email.value = 'aluno@unicamp.br'
  password.value = '123456'
  await handleLogin()
}

const quickLoginTeacher = async () => {
  email.value = 'prof@unicamp.br'
  password.value = '123456'
  await handleLogin()
}

const quickLoginCoordinator = async () => {
  email.value = 'coord@unicamp.br'
  password.value = '123456'
  await handleLogin()
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const success = await authStore.login(email.value, password.value)

    if (success) {
      // Redireciona baseado no tipo de usuário
      const userType = authStore.user.type
      
      if (userType === 'student') {
        router.push('/perfil/aluno')
      } else if (userType === 'teacher') {
        router.push('/perfil/docente')
      } else if (userType === 'coordinator') {
        router.push('/perfil-coordenador')
      }
    } else {
      error.value = 'Email ou senha inválidos'
    }
  } catch (err) {
    error.value = 'Erro ao fazer login. Tente novamente.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
}

.quick-login-section {
  margin-bottom: 25px;
}

.quick-login-title {
  text-align: center;
  color: #333;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-login-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-quick-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #333;
}

.btn-quick-login i {
  font-size: 24px;
}

.btn-quick-login:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.btn-student {
  border-color: #4CAF50;
}

.btn-student:hover:not(:disabled) {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.btn-student i {
  color: #4CAF50;
}

.btn-teacher {
  border-color: #2196F3;
}

.btn-teacher:hover:not(:disabled) {
  border-color: #2196F3;
  background: #f0f7ff;
}

.btn-teacher i {
  color: #2196F3;
}

.btn-coordinator {
  border-color: #FF9800;
}

.btn-coordinator:hover:not(:disabled) {
  border-color: #FF9800;
  background: #fff7f0;
}

.btn-coordinator i {
  color: #FF9800;
}

.btn-quick-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 20px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
}
</style>
