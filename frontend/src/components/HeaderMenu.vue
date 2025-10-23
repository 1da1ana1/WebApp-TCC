<template>
<header>
    <img src="/src/assets/img/logos-header.png" alt="logo ft" class="header">

    <nav class="header__nav">
      <ul class="header__nav-list">
        <li><a href="#" class="header__nav-item">PÁGINA INICIAL</a></li>
        <li><a href="#" class="header__nav-item">BUSCAR ORIENTADOR</a></li>
        <li><a href="#" class="header__nav-item">MEU PERFIL</a></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, var(--ft-color-blue), var(--ft-color-green));
  padding: 0.8rem 2rem;
  color: var(--text-color-secondary);
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__logo-img {
  height: 40px;
}

.header__ft-logo {
  height: 36px;
}

.header__nav-list {
  display: flex;
  gap: 1rem;
  list-style: none;
}

.header__nav-item {
  text-decoration: none;
  color: var(--text-color-secondary);
  background-color: var(--ft-color-blue);
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  transition: background-color 0.3s;
  font-size: 0.9rem;
  font-weight: 500;
}

.header__nav-item:hover {
  background-color: var(--text-color-submenu-hover);
}
</style>