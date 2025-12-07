<template>
  <header class="header" :class="{ 'header-public': isPublic }">
    <img src="/src/assets/img/logos-header.png" alt="logo ft" class="header-logo" />

    <nav class="header-nav-desktop">
      <ul class="header-links">
        
        <li v-if="isPublic">
          <router-link to="/login" class="header-nav-item btn-login-especial">
            <span>Fazer Login </span>
            <i class="bi bi-box-arrow-in-right"></i>
          </router-link>
        </li>

        <template v-else>
          <li><router-link to="/" class="header-nav-item">PÁGINA INICIAL</router-link></li>
          <li><router-link to="/search-supervisor" class="header-nav-item">BUSCAR ORIENTADOR</router-link></li>

          
          <li v-if="authStore.user">
            <router-link to="/perfil/aluno" class="header-nav-item">
              MEU PERFIL
            </router-link>
          </li>

          </template>

      </ul>
    </nav>
    
    </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();


defineProps({
  isPublic: {
    type: Boolean,
    default: false
  }
});

</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.8rem 4.5rem;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  height: 5rem;
  width: 100%;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

.header-logo {
  width: 20rem;
  height: auto;
  object-fit: contain;
}

.header-nav-desktop {
  background-color: var(--white-color);
  height: 3rem;
  width: 33rem;
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-nav-desktop .header-links {
  display: flex;
  gap: 5rem;
  list-style: none;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.header-nav-desktop .header-links a {
  text-decoration: none;
  color: #000;
  font-size: 0.8rem;
  font-weight: 500;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.header-links a:hover {
  color: var(--color-text-muted);
  transform: scale(1.1);
}

.header-nav-mobile {
  display: none;
}

.header-public .header-nav-desktop {
  width: auto;
  padding: 0 2rem;
  height: 3rem; 
}

.header-public span{
  font-size: 1rem;
  font-weight: 400;
  font-style: italic;
}


.header-public .btn-login-especial {
  display: flex;
  align-items: center;
  gap: 0.7rem; 
  width: auto; 
  color: var(--color-brand-primary); 
}

.header-public .btn-login-especial i {
  display: flex;
  align-items: center;
  font-size: 2em;
}

#menuToggle {
  display: block;
  position: relative;
  z-index: 1;
  -webkit-user-select: none;
  user-select: none;
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
  z-index: 1;
  transform-origin: 4px 0px;
  transition:
    transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
    background 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
    opacity 0.55s ease;
}

#menuToggle span:first-child {
  transform-origin: 0% 0%;
}

#menuToggle span:nth-last-child(2) {
  transform-origin: 0% 100%;
}

#menuToggle input:checked ~ span {
  opacity: 1;
  transform: rotate(45deg) translate(-3px, -1px);
  background: var(--white-color);
}

#menuToggle input:checked ~ span:nth-last-child(3) {
  opacity: 0;
  transform: rotate(0deg) scale(0.2, 0.2);
}

#menuToggle input:checked ~ span:nth-last-child(2) {
  transform: rotate(-45deg) translate(0, -1px);
}

#menu {
  position: fixed;
  width: 15.625rem;
  height: 100vh;
  top: 0;
  left: 0;
  margin: 0;
  padding: 1.8rem;
  padding-top: 6rem;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  -webkit-font-smoothing: antialiased;
  transform-origin: 0% 0%;
  transform: translate(-100%, 0);
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
  z-index: -1;
}

#menu li {
  list-style-type: none;
  padding: 10px 0;
  transition-delay: 2s;
  text-decoration: none;
}

#menu a {
  display: flex;
  text-decoration: none;
  height: 2.3rem;
  width: 11.3rem;
  background-color: var(--white-color);
  border-radius: 1.3rem;
  color: #1e1e23;
  font-family:
    'Poppins',
    sans serif;
  font-size: 1rem;
  font-weight: 500;
  justify-content: center;
  align-items: center;
   transition: transform 0.3s ease;
}

#menu a:hover {
  transform: scale(1.06);
}

#menuToggle input:checked ~ ul {
  transform: none;
  z-index: 1;
}

@media (max-width: 769px) {
  .header-nav-desktop {
    display: none;
  }

  .header-nav-mobile {
    display: block;
  }

  .header {
    padding: 1rem;
  }

  .header-logo {
    max-width: 150px;
  }
}

@media (max-width: 400px) {
  .header-logo {
    max-width: 180px;
  }

  .header {
    padding: 1rem;
  }
}
</style>
