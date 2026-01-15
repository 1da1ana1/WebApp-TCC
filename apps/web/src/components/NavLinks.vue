<template>
  <li v-for="(item, index) in menuItems" :key="index">
    
    <a v-if="item.action" 
       href="#" 
       @click.prevent="item.action" 
       class="header-nav-item" 
       :class="item.class">
       <span>{{ item.label }}</span>
       <i v-if="item.icon" :class="item.icon"></i>
    </a>

    <router-link v-else 
       :to="item.path" 
       class="header-nav-item" 
       :class="item.class">
       <span>{{ item.label }}</span>
       <i v-if="item.icon" :class="item.icon"></i>
    </router-link>

  </li>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = computed(() => {
  const user = authStore.user;

  // 1. Visitante (Não logado)
  if (!user) {
    return [
      { 
        label: 'FAZER LOGIN', 
        path: '/login', 
        icon: 'bi bi-box-arrow-in-right', // Mantido pois é botão especial
        class: 'btn-login-especial' 
      }
    ];
  }

  // 2. COORDENADOR (Sem ícones na navegação)
  if (user.type === 'coordinator') {
    return [
      { label: 'PÁGINA INICIAL', path: '/' },
      { label: 'BUSCAR USUÁRIO', path: '/coordenador/buscar-usuario' },
      { label: 'PAINEL DE ANÁLISES', path: '/perfil-coordenador' },
      { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
    ];
  }

  // 3. DOCENTE (Sem ícones na navegação)
  if (user.type === 'teacher') {
    return [
      { label: 'PÁGINA INICIAL', path: '/' },
      { label: 'PÁGINA DE ALUNOS', path: '/docente/orientandos' },
      { label: 'MEU PERFIL', path: '/perfil/docente' },
      { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
    ];
  }

  // 4. ALUNO (Padrão)
  return [
    { label: 'PÁGINA INICIAL', path: '/' },
    { label: 'BUSCAR ORIENTADOR', path: '/search-supervisor' },
    { label: 'MEU PERFIL', path: '/perfil/aluno' },
    { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
  ];
});
</script>