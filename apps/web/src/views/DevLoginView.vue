<template>
  <div class="dev-login-page">
    <main class="dev-login-card">
      <h1 class="dev-login-title">Selecione o Papel</h1>

      <div class="role-grid" role="group" aria-label="Selecione o papel">
        <button
          v-for="role in roles"
          :key="role.key"
          class="role-btn"
          :class="`role-btn--${role.theme}`"
          :disabled="loading"
          :aria-busy="loading && pendingRole === role.key"
          @click="loginAs(role)"
        >
          <span class="role-btn__icon" aria-hidden="true">{{ role.icon }}</span>
          <span class="role-btn__label">{{ role.label }}</span>
          <span class="role-btn__email">{{ role.email }}</span>
          <span
            v-if="loading && pendingRole === role.key"
            class="role-btn__spinner"
            aria-hidden="true"
          ></span>
        </button>
      </div>

      <p v-if="error" class="dev-login-error" role="alert">
        {{ error }}
      </p>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const SEED_PASSWORD = '123456'

const roles = [
  {
    key: 'STUDENT',
    label: 'Entrar como Aluno',
    email: 'aluno@unicamp.br',
    redirect: '/perfil/aluno',
    theme: 'student',
    icon: '🎓',
  },
  {
    key: 'TEACHER',
    label: 'Entrar como Professor',
    email: 'professor@unicamp.br',
    redirect: '/perfil/docente',
    theme: 'teacher',
    icon: '👨‍🏫',
  },
  {
    key: 'COORDINATOR',
    label: 'Entrar como Coordenador',
    email: 'coord@unicamp.br',
    redirect: '/perfil-coordenador',
    theme: 'coordinator',
    icon: '📋',
  },
]

const loading = ref(false)
const pendingRole = ref(null)
const error = ref('')

const loginAs = async (role) => {
  loading.value = true
  pendingRole.value = role.key
  error.value = ''

  try {
    const ok = await authStore.login(role.email, SEED_PASSWORD)
    if (!ok) {
      throw new Error(
        `Credenciais rejeitadas pelo backend para ${role.email}. ` +
          'Verifique se o seed (npx prisma db seed) foi executado.',
      )
    }
    router.push(role.redirect)
  } catch (err) {
    console.error('[DevLogin] falha ao autenticar:', err)
    error.value =
      err?.message || 'Erro ao autenticar contra o backend. Veja o console.'
  } finally {
    loading.value = false
    pendingRole.value = null
  }
}
</script>

<style scoped>
.dev-login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f9;
  font-family: 'Poppins', system-ui, sans-serif;
}

.dev-login-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
}

.dev-login-title {
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  color: #1f2937;
  margin: 0 0 2rem;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 780px;
}

.role-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #fff;
  color: #1f2937;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.role-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.role-btn:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

.role-btn:disabled {
  opacity: 0.6;
  cursor: progress;
}

.role-btn__icon {
  font-size: 2rem;
}

.role-btn__label {
  font-weight: 600;
  font-size: 1rem;
}

.role-btn__email {
  font-size: 0.78rem;
  color: #6b7280;
  font-family: 'Courier New', monospace;
}

.role-btn--student      { border-color: #93c5fd; }
.role-btn--student:hover:not(:disabled) { border-color: #2563eb; }

.role-btn--teacher      { border-color: #c4b5fd; }
.role-btn--teacher:hover:not(:disabled) { border-color: #7c3aed; }

.role-btn--coordinator  { border-color: #86efac; }
.role-btn--coordinator:hover:not(:disabled) { border-color: #16a34a; }

.role-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-top-color: #1f2937;
  border-radius: 50%;
  animation: dev-spin 0.7s linear infinite;
  margin-top: 0.4rem;
}

@keyframes dev-spin {
  to { transform: rotate(360deg); }
}

.dev-login-error {
  margin-top: 1.5rem;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  max-width: 540px;
  font-size: 0.88rem;
}

@media (max-width: 480px) {
  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>