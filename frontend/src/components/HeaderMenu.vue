<template>
  <header class="header">
    <img src="/src/assets/img/logos-header.png" alt="logo ft">
    <nav class="header-nav">
      <ul class="header-links">
        <li><a href="#" class="header__nav-item">PÁGINA INICIAL</a></li>
        <li><a href="#" class="header__nav-item">BUSCAR ORIENTADOR</a></li>
        <li><a href="#" class="header__nav-item">MEU PERFIL</a></li>
      </ul>
    </nav>
  </header>
</template>

<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  height: 80px;
};

.header-links li{
    text-decoration: none
}

</style>
