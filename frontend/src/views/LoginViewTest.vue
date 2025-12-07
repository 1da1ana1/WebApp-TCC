<template>
  <div class="login-page">
    <div class="login-card">
      <h2>🔐 Login de Desenvolvimento</h2>
      <p>Simule o acesso do aluno (Mock)</p>
      
      <button @click="entrar" class="btn-login">
        Entrar como Aluno
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function entrar() {
  // Chama a ação login do seu arquivo auth.js
  const sucesso = await authStore.login('aluno@unicamp.br', '123456');
  
  if (sucesso) {
    alert('Login realizado com sucesso!');
    router.push('/'); // Manda para a Home (agora logado)
  } else {
    alert('Erro no login');
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
.login-card {
  text-align: center;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
}
.btn-login {
  background-color: var(--color-brand-primary, #004b86);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
}
</style>