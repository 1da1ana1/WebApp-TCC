<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Login de Desenvolvimento</h2>
      <p>Selecione um perfil para simular o acesso:</p>
      
      <div class="button-group">
        <button @click="entrar('aluno')" class="btn-login btn-aluno">
          👨‍🎓 Entrar como Aluno
        </button>

        <button @click="entrar('docente')" class="btn-login btn-docente">
          👨‍🏫 Entrar como Docente
        </button>

        <button @click="entrar('admin')" class="btn-login btn-admin">
          👔 Entrar como Coordenador
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const credenciais = {
  aluno:   { email: 'aluno@unicamp.br', pass: '123456' },
  docente: { email: 'prof@unicamp.br',  pass: '123456' },
  admin:   { email: 'coord@unicamp.br', pass: '123456' }
};

async function entrar(tipo) {
  const { email, pass } = credenciais[tipo];
  
  const sucesso = await authStore.login(email, pass);
  
  if (sucesso) {
    if (tipo === 'admin') {
      router.push('/perfil-coordenador'); 
    } else {
      router.push('/'); 
    }
  } else {
    alert('Erro no login simulado.');
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; 
  background-color: #f4f4f4;
}

.login-card {
  text-align: center;
  padding: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem; 
  margin-top: 1.5rem;
}

.btn-login {
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-login:hover {
  opacity: 0.9;
}
.btn-aluno { background-color: #004b86; }   /* Azul Unicamp */
.btn-docente { background-color: #2e7d32; } /* Verde */
.btn-admin { background-color: #c62828; }   /* Vermelho */
</style>