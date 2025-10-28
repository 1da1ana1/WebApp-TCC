<template>
  <header class="header">
    <img src="/src/assets/img/logos-header.png" alt="logo ft" />

    <nav class="header-nav">
      <ul class="header-links">
        <li><a href="#" class="header-nav-item">PÁGINA INICIAL</a></li>
        <li><a href="#" class="header-nav-item">BUSCAR ORIENTADOR</a></li>
        <li><a href="#" class="header-nav-item">MEU PERFIL</a></li>
      </ul>
    </nav>
  </header>
</template>

<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.625rem;
  background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary));
  height: 5rem;
  padding: 3.75rem 4.5rem;
}

.header-links {
  display: flex;
  gap: 5rem;
  list-style: none;
  justify-content: center;
  margin-top: 0.66rem;
  align-items: center; 
  padding: 0; 
}

.header-links a {
  text-decoration: none;
  color: #000000;
  font-size: 0.8rem;
}

.header-nav {
  background-color: var(--white-color);
  height: 3rem;
  width: 33rem;
  border-radius: 2rem;
}

img {
  width: 20rem;
  height: auto;
  object-fit: contain;
}

@media (max-width: 769px) {
  .header {
    height: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    position: fixed;
  }

  img {
    max-width: 150px;
    height: auto;
  }

  .header-nav {
    width: auto;
    max-width: 100%;
    height: 2.5rem;
    padding: 0 1rem;
  }

  .header-links {
    gap: 1rem;
  }

  .header-links a {
    font-size: 0.7rem;
  }
}


@media (max-width: 400px) {
  .header-links {
    gap: 0.5rem; 
  }
  .header-links a {
    font-size: 0.65rem;
  }
  img {
    max-width: 120px;
  }
}
</style>
