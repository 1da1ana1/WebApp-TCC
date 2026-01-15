<template>
  <li v-for="(item, index) in menuItems" :key="index">
    
    <a v-if="item.action" 
       href="#" 
       @click.prevent="item.action" 
       class="header-nav-item" 
       :class="item.class">
       <span v-if="!item.iconOnly">{{ item.label }}</span>
       <i v-if="item.icon" :class="item.icon"></i>
    </a>

    <router-link v-else 
       :to="item.path" 
       class="header-nav-item" 
       :class="item.class">
       <span v-if="!item.iconOnly">{{ item.label }}</span>
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
        icon: 'bi bi-box-arrow-in-right', 
        class: 'btn-login-especial' 
      }
    ];
  }

  // 2. Coordenador (Menu Novo)
  if (user.type === 'coordinator') {
    return [
      { label: 'DASHBOARD', path: '/perfil-coordenador', icon: 'bi bi-speedometer2' },
      { label: 'GESTÃO', path: '/coordenador/gestao' },
      { label: 'MEU PERFIL', path: '/perfil-coordenador/editar' },
      { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
    ];
  }

  // 3. Docente
  if (user.type === 'teacher') {
    return [
      { label: 'MEUS ORIENTANDOS', path: '/docente/orientandos' },
      { label: 'SOLICITAÇÕES', path: '/docente/solicitacoes' },
      { label: 'MEU PERFIL', path: '/perfil/docente' },
      { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
    ];
  }

  // 4. Aluno (Padrão)
  return [
    { label: 'PÁGINA INICIAL', path: '/' },
    { label: 'BUSCAR ORIENTADOR', path: '/search-supervisor' },
    { label: 'MEU PERFIL', path: '/perfil/aluno' },
    { label: 'SAIR', action: logout, icon: 'bi bi-box-arrow-right', class: 'btn-logout' }
  ];
});
</script>