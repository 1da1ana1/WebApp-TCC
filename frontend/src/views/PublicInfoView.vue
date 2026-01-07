<template>
  <div class="page-container">
    <nav id="side-menu">
      <ul id="side-menu-ul">
        <li class="side-menu-li" @click="scrollToSection('section-1')">
          <span>Vou fazer TCC, e agora?</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>

        <li class="side-menu-li" @click="scrollToSection('section-2')">
          <span>Cronograma de buscas</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>

        <li class="side-menu-li" @click="scrollToSection('section-3')">
          <span>Dúvidas frequentes</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>
      </ul>
    </nav>

    <main class="content-area">
      <section id="section-1" class="info-section">
        <div class="glass-card">
          <h2>Vou fazer TCC, e agora?</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo unde ipsum non aperiam
            perferendis facere perspiciatis nulla explicabo sapiente! Deserunt perspiciatis minima
            voluptatum alias at facilis nisi beatae ullam rerum.
          </p>
          <div class="fake-content"></div>
        </div>
      </section>

      <section id="section-2" class="info-section">
        <div class="glass-card">
          <h2>Cronograma de Buscas</h2>
          <p class="subtitle">Fique atento às datas e prazos do semestre atual.</p>

          <CronogramSchedule />
        </div>
      </section>

      <section id="section-3" class="info-section">
        <div class="glass-card">
          <h2>Dúvidas frequentes</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur necessitatibus
            numquam, vero eligendi impedit atque nam eius modi, natus a minima corporis mollitia,
            molestias excepturi laborum quis odio dolorum quisquam!
          </p>
          <div class="fake-content"></div>
        </div>
      </section>
    </main>
    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      type="button"
      class="btn btn-danger btn-floating btn-lg"
      id="btn-back-to-top"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import CronogramSchedule from '@/components/CronogramSchedule.vue'

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

const showBackToTop = ref(false)

const handleScroll = () => {

  showBackToTop.value = window.scrollY > 700
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.page-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-image: url('@/assets/img/students.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

#side-menu {
  background-color: var(--color-brand-primary, #003366);
  width: 22.813rem;

  position: fixed;
  left: 0;

  top: var(--header-height);

  height: calc(100vh - var(--header-height));

  display: flex;
  flex-direction: column;
}

#side-menu-ul {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.side-menu-li {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  text-decoration: none;
  list-style: none;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-secondary, #ccc);
  border-bottom: 2px solid #fff;
  cursor: pointer;
  box-shadow: inset 0 0 0 0 #54b3d6;
  transition:
    color 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
}

.side-menu-li:hover {
  color: #fff;
  box-shadow: inset 23rem 0 0 0 #54b3d6;
}

.content-area {
  margin-left: 22.813rem;
  width: calc(100% - 22.813rem);
  padding: 3rem;
  padding-top: 6rem;
}

.info-section {
  margin-bottom: 2rem;
}

.glass-card {
  background: var(--color-background-card-default);
  padding: 3rem;
  border-radius: 8px;
}

.fake-content {
  height: 400px;
}


#btn-back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;

  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--color-brand-primary);
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;

  transition:
    transform 0.3s,
    background-color 0.3s;
}

#btn-back-to-top:hover {
  background-color: var(--color-brand-primary);
  transform: scale(1.15);
}
</style>
