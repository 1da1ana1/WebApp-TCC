<template>
  <header class="header" :class="{ 'header-public': isPublic }">
    <img src="/src/assets/img/logos-header.png" alt="logo ft" class="header-logo" />

    <nav class="header-nav-desktop">
      <ul class="header-links">
        
        <li v-if="isPublic">
          <router-link to="/login" class="header-nav-item btn-login-especial">
            <span>FAZER LOGIN</span>
            <i class="bi bi-box-arrow-in-right"></i>
          </router-link>
        </li>

        <template v-else>
          <li><router-link to="/" class="header-nav-item">PÁGINA INICIAL</router-link></li>
          <li><router-link to="/search-supervisor" class="header-nav-item">BUSCAR ORIENTADOR</router-link></li>
          <li v-if="authStore.user">
            <router-link :to="linkPerfil" class="header-nav-item">MEU PERFIL</router-link>
          </li>
        </template>

      </ul>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();

defineProps({
  isPublic: {
    type: Boolean,
    default: false
  }
});

const linkPerfil = computed(() => {

  const userType = authStore.user?.type; 
  
  if (userType === 'docente' || userType === 'orientador') {
    return '/perfil/docente';
  }
  return '/perfil/aluno';
});
</script>

<style scoped>
/* ==========================================================================
   1. ESTRUTURA GLOBAL DO HEADER 
   ========================================================================== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rem; 
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  height: 4.325rem; /* Altura afinada */
  width: 100%;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

.header-logo {
  width: 13.9rem;
  height: auto;
  object-fit: contain;
}

/* ==========================================================================
   2. NAVEGAÇÃO DESKTOP (CÁPSULA BRANCA)
   ========================================================================== */
.header-nav-desktop {
  background-color: var(--white-color);
  height: 2.3rem; 
  width: auto; 
  padding: 0 2rem; 
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-links {
  display: flex;
  gap: 2rem; 
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

/* ==========================================================================
   3. TIPOGRAFIA UNIFICADA (O QUE DEVE TER)
   ========================================================================== */
.header-nav-item {
  text-decoration: none;
  color: #000;
  font-size: 0.75rem; 
  font-weight: 500;   
  text-transform: uppercase; 
  transition: color 0.3s ease, transform 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background: none;
  border: none;
}

.header-nav-item:hover {
  color: var(--color-text-muted);
  transform: scale(1.05);
}


.btn-login-especial {
  color: var(--color-brand-primary);
}

.btn-login-especial i {
  font-size: 1.4rem; 
  display: flex;
  align-items: center;
}

/* ==========================================================================
   4. MENU MOBILE
   ========================================================================== */
#menuToggle {
  display: block;
  position: relative;
  z-index: 1;
}

#menuToggle input {
  display: block;
  width: 40px;
  height: 32px;
  position: absolute;
  top: -7px;
  left: -5px;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
}

#menuToggle span {
  display: block;
  width: 29px;
  height: 2px;
  margin-bottom: 5px;
  position: relative;
  background: var(--white-color);
  border-radius: 3px;
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1), background 0.5s;
}

#menu {
  position: fixed;
  width: 15.625rem;
  height: 100vh;
  top: 0;
  left: 0;
  margin: 0;
  padding: 6rem 1.8rem 1.8rem 1.8rem;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  transform: translate(-100%, 0);
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
  z-index: -1;
}

#menu a {
  display: flex;
  text-decoration: none;
  height: 2.3rem;
  width: 100%;
  background-color: var(--white-color);
  border-radius: 1.3rem;
  color: #1e1e23;
  font-size: 0.85rem;
  font-weight: 500;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
}


#menuToggle input:checked ~ span { opacity: 1; transform: rotate(45deg) translate(-3px, -1px); }
#menuToggle input:checked ~ span:nth-last-child(3) { opacity: 0; transform: rotate(0deg) scale(0.2, 0.2); }
#menuToggle input:checked ~ span:nth-last-child(2) { transform: rotate(-45deg) translate(0, -1px); }
#menuToggle input:checked ~ ul { transform: none; }

/* ==========================================================================
   5. RESPONSIVIDADE
   ========================================================================== */
@media (max-width: 769px) {
  .header-nav-desktop { display: none; }
  .header { padding: 0 1.5rem; height: 3.5rem; }
  .header-logo { max-width: 130px; }
}
</style>