<template>
  <div class="login-container">
    <h1>Login de Desenvolvimento</h1>
    <p>Simule o login da UNICAMP para testar o sistema.</p>

    <button @click="entrarComoAluno" class="btn-dev">
      Entrar como Aluno (Teste)
    </button>

    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function entrarComoAluno() {
  // Chama aquela ação mockada que criamos no Pinia
  // Passamos as credenciais que sabemos que funcionam no teste
  const sucesso = authStore.login('aluno@unicamp.br', '123456');
  
  if (sucesso) {
    // Se deu certo, manda o usuário para a Home ou Dashboard
    router.push('/'); 
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1rem;
}
.btn-dev {
  padding: 1rem 2rem;
  background-color: var(--color-brand-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}
.btn-dev:hover {
  opacity: 0.9;
}
</style>