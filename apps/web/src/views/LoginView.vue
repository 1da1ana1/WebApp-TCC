<template>
  <div class="login-container">
    <div class="login-box">
      <h1>TCC Management System</h1>
      <p class="subtitle">Sistema de Gestão de Trabalhos de Conclusão de Curso</p>

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

      <div class="demo-credentials">
        <h3>Credenciais de Demonstração:</h3>
        <p><strong>Aluno:</strong> aluno@unicamp.br / 123456</p>
        <p><strong>Professor:</strong> prof@unicamp.br / 123456</p>
        <p><strong>Coordenador:</strong> coord@unicamp.br / 123456</p>
      </div>
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

.demo-credentials {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.demo-credentials h3 {
  color: #333;
  font-size: 14px;
  margin-bottom: 10px;
}

.demo-credentials p {
  color: #666;
  font-size: 13px;
  margin: 5px 0;
  font-family: 'Courier New', monospace;
}
</style>
