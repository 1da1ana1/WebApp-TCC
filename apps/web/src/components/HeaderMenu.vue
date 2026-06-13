<template>
  <header class="header">
    <router-link to="/" class="logo-link">
      <img src="/src/assets/img/logos-header.png" alt="logo ft" class="header-logo" />
    </router-link>

    <nav class="header-nav-desktop">
      <ul class="header-links">
        <NavLinks />
        <NotificationBell />
      </ul>
    </nav>

    <div id="menuToggle" class="mobile-only">
      <input type="checkbox" />
      <span></span><span></span><span></span>
      
      <ul id="menu">
        <NavLinks />
      </ul>
    </div>
  </header>
</template>

<script setup>
import NavLinks from '@/components/NavLinks.vue';
import NotificationBell from '@/components/NotificationBell.vue';
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
  height: 4.325rem;
  width: 100%;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

/* Container do link da logo para ajustar o clique */
.logo-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s ease; /* Alterado para focar na opacidade */
}

/* Efeito suave de diminuir a opacidade no hover */
.logo-link:hover {
  opacity: 0.75; /* Altere este valor (0.0 a 1.0) se quiser mais ou menos transparente */
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
   3. TIPOGRAFIA UNIFICADA
   ========================================================================== */
/* OBS: Adicionado :deep() para pegar os elementos dentro do NavLinks.vue */
.header-links :deep(.header-nav-item) {
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
  font-family: inherit;
}

.header-links :deep(.header-nav-item:hover) {
  color: var(--color-text-muted);
  transform: scale(1.05);
}

/* Estilos Especiais */
.header-links :deep(.btn-login-especial) {
  color: var(--color-brand-primary) !important;
  font-weight: 700;
}

.header-links :deep(.btn-login-especial i) {
  font-size: 1.4rem; 
  display: flex;
  align-items: center;
}

.header-links :deep(.btn-logout) {
  color: #c62828 !important; /* Vermelho para sair */
}

/* ==========================================================================
   4. MENU MOBILE
   ========================================================================== */
.mobile-only { display: none; }

#menuToggle {
  display: none;
  position: relative;
  z-index: 1;
}

#menuToggle input {
  display: block; width: 40px; height: 32px; position: absolute;
  top: -7px; left: -5px; cursor: pointer; opacity: 0; z-index: 2;
}

#menuToggle span {
  display: block; width: 29px; height: 2px; margin-bottom: 5px;
  position: relative; background: var(--white-color); border-radius: 3px;
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1), background 0.5s;
}

#menu {
  position: fixed; width: 15.625rem; height: 100vh; top: 0; left: 0; margin: 0;
  padding: 6rem 1.8rem 1.8rem 1.8rem;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  transform: translate(-100%, 0);
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
  z-index: -1; list-style: none; /* Importante remover bullets */
}

/* Estilização dos links NO MOBILE */
#menu :deep(.header-nav-item) {
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
  .mobile-only { display: block; } /* Mostra hamburger */
  #menuToggle { display: block; }
  .header { padding: 0 1.5rem; height: 3.5rem; }
  .header-logo { max-width: 130px; }
}
</style>