
<template>
  <section class="timeline-section">
    <div class="timeline-grid">
      <div 
        v-for="(step, index) in timelineSteps" 
        :key="index" 
        class="timeline-item" 
        :class="{ active: step.active }"
      >
        <div class="icon-box">
          <i :class="['bi', step.icon]"></i>
        </div>

        <h4 class="timeline-title">{{ step.label }}</h4>
        <span v-if="step.date" class="timeline-date">{{ step.date }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// Dados centralizados. Alterou aqui, altera no site todo.
const timelineSteps = ref([
  { label: 'Definição de vagas', date: '01/02 a 10/02', icon: 'bi-paperclip', active: false },
  { label: 'Cadastro de temas', date: '11/02 a 15/02', icon: 'bi-list-check', active: false },
  { label: 'Período de busca', date: '16/02 a 25/02', icon: 'bi-chat-left-text', active: true }, // Defina qual é o ativo padrão
  { label: 'Análise solicitações', date: '26/02 a 28/02', icon: 'bi-hourglass-split', active: false },
  { label: 'Confirmação vínculo', date: '01/03', icon: 'bi-person-check', active: false },
  { label: 'Encerramento', date: '05/03', icon: 'bi-lock', active: false },
  { label: 'Início orientações', date: '10/03', icon: 'bi-pencil-square', active: false },
  { label: 'Homologação', date: '15/03', icon: 'bi-graph-up', active: false },
])
</script>

<style scoped>
.timeline-section {
  background-color: #d3d3d3; /* Fundo cinza */
  padding: 2rem 0;
  border-bottom: 1px solid #bcbcbc;
  display: flex;
  justify-content: center;
  width: 100%;
}

.timeline-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  overflow-x: auto; /* Permite scroll no mobile */
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  min-width: 110px;
}

/* Linha conectora */
.timeline-item::after {
  content: '';
  position: absolute;
  top: 25px; /* Centro do ícone */
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #000; /* Linha preta */
  z-index: 0;
  opacity: 1; /* Linha bem visível */
}

.timeline-item:last-child::after {
  display: none;
}

/* Box do ícone */
.icon-box {
  background-color: #d3d3d3; /* Mesma cor do fundo para cortar a linha */
  z-index: 1;
  padding: 0 10px;
  margin-bottom: 10px;
}

.timeline-item .bi {
  font-size: 2.2rem;
  color: #000; /* Força a cor preta no ícone */
  transition: transform 0.3s ease;
}

/* Texto */
.timeline-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #000;
  margin: 0 0 5px 0;
  line-height: 1.2;
  z-index: 1;
}

.timeline-date {
  font-size: 0.7rem;
  color: #333;
  font-weight: normal;
}

/* ESTADO ATIVO (Opcional - Se quiser destacar o atual) */
/* Se quiser que o ativo fique preto também, remova as cores abaixo */
.timeline-item.active .bi {
  /* color: var(--color-brand-primary); Se quiser azul, descomente */
  font-weight: bold;
  transform: scale(1.1);
}

.timeline-item.active .timeline-title {
  font-weight: 800;
}

</style>