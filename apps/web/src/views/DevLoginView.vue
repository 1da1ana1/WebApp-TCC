<template>
  <div class="dev-login-page">
    <header class="dev-warning" role="alert" aria-live="polite">
      <span class="dev-warning__icon" aria-hidden="true">⚠</span>
      <span class="dev-warning__text">
        Tela exclusiva para ambiente de testes
      </span>
    </header>

    <main class="dev-login-card">
      <h1 class="dev-login-title">
        Ambiente de Desenvolvimento: Selecione o Papel
      </h1>
      <p class="dev-login-subtitle">
        Autentica contra o backend usando os usuários seedados em
        <code>apps/api/seed.ts</code>. Requer
        <code>npx prisma db seed</code> executado.
      </p>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Gate de ambiente — defesa em profundidade.
//
// Liberado quando:
//   1. Build é de desenvolvimento (vite dev / vite preview de uma build dev), OU
//   2. A flag VITE_ENABLE_DEV_LOGIN === 'true' está setada na build.
//
// Em produção, com a flag false/ausente, a tela redireciona pra raiz mesmo
// se a rota chegar a ser registrada por engano. O gate definitivo (que
// remove a rota inteira do bundle) está no router/index.js.
//
// Importante: vars VITE_* são inlinadas em build time pelo Vite. Trocar
// VITE_ENABLE_DEV_LOGIN no servidor de Staging exige rebuild — não é
// um toggle runtime. Para flip runtime seria preciso config endpoint.
const isDevLoginEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'

onMounted(() => {
  if (!isDevLoginEnabled) {
    router.replace('/')
  }
})

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

/* --- Banner de alerta --- */
.dev-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: repeating-linear-gradient(
    135deg,
    #fff3b0 0 12px,
    #ffe680 12px 24px
  );
  color: #5a4a00;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.6rem 1rem;
  border-bottom: 2px solid #d6b800;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.dev-warning__icon {
  font-size: 1.1rem;
}

/* --- Card central --- */
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
  margin: 0 0 0.5rem;
}

.dev-login-subtitle {
  color: #4b5563;
  font-size: 0.9rem;
  max-width: 540px;
  margin: 0 0 2rem;
  line-height: 1.45;
}

.dev-login-subtitle code {
  background: #e5e7eb;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.82rem;
}

/* --- Grid de botões --- */
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

/* Identidade visual por papel */
.role-btn--student      { border-color: #93c5fd; }
.role-btn--student:hover:not(:disabled) { border-color: #2563eb; }

.role-btn--teacher      { border-color: #c4b5fd; }
.role-btn--teacher:hover:not(:disabled) { border-color: #7c3aed; }

.role-btn--coordinator  { border-color: #86efac; }
.role-btn--coordinator:hover:not(:disabled) { border-color: #16a34a; }

/* Spinner inline */
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

/* Mensagem de erro */
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

/* --- Responsivo --- */
@media (max-width: 480px) {
  .role-grid {
    grid-template-columns: 1fr;
  }

  .dev-warning {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>
