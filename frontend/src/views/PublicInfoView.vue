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

          <div class="timeline-grid">
            <div v-for="item in cronograma" :key="item.id" class="timeline-item">
              <div class="icon-box">
                <i :class="['bi', item.icon]"></i>
              </div>

              <span class="timeline-date">{{ item.data }}</span>

              <h4 class="timeline-title">{{ item.titulo }}</h4>
            </div>
          </div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- DADOS DO CRONOGRAMA (SCRIPT PRONTO) ---
// Para mudar a data, basta alterar o campo 'data' aqui.
// No futuro, isso pode vir de uma API: const cronograma = await api.get('/cronograma')
const cronograma = ref([
  { 
    id: 1, 
    titulo: 'Definição de vagas', 
    data: '01/02 a 10/02', 
    icon: 'bi-paperclip' // O ícone de clipe que você pediu
  },
  { 
    id: 2, 
    titulo: 'Cadastro de temas', 
    data: '11/02 a 15/02', 
    icon: 'bi-pencil-square' 
  },
  { 
    id: 3, 
    titulo: 'Período de busca e solicitação', 
    data: '16/02 a 25/02', 
    icon: 'bi-search' 
  },
  { 
    id: 4, 
    titulo: 'Confirmação do vínculo', 
    data: '26/02 a 28/02', 
    icon: 'bi-check-circle-fill' 
  },
  { 
    id: 5, 
    titulo: 'Encerramento do período', 
    data: '01/03', 
    icon: 'bi-calendar-x' 
  },
  { 
    id: 6, 
    titulo: 'Início das orientações', 
    data: '05/03', 
    icon: 'bi-people-fill' 
  },
  { 
    id: 7, 
    titulo: 'Homologação e análise', 
    data: '10/03', 
    icon: 'bi-file-earmark-check' 
  }
]);

// Função de Rolagem
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};
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
  min-height: 90vh;
  margin-bottom: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.fake-content {
  height: 400px;
  background-color: #f4f4f4;
  margin-top: 1rem;
  border-radius: 4px;
}
</style>
