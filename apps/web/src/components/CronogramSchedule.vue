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
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimelineStore } from '@/stores/timelineData'

const timelineStore = useTimelineStore()
const { steps } = storeToRefs(timelineStore)

const timelineSteps = computed(() => steps.value)

onMounted(() => {
  if (!timelineStore.hasLoaded) {
    timelineStore.loadActiveSemester()
  }
})
</script>
<style scoped>
.timeline-section {
  background-color: #d3d3d3; /* Fundo cinza */
  padding: 2rem 0;
  border-bottom: 1px solid #bcbcbc;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto; /* Garante scroll se a tela for pequena */
}

.timeline-grid {
  display: flex;
  justify-content: space-between; /* Espalha horizontalmente */
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  position: relative;
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column; /* Ícone em cima, texto embaixo */
  align-items: center;
  text-align: center;
  position: relative;
  min-width: 100px; /* Largura mínima para não quebrar */
}

/* --- LINHA CONECTORA HORIZONTAL --- */
.timeline-item::after {
  content: '';
  position: absolute;
  top: 25px; /* Altura do centro do ícone (ajuste se mudar o tamanho do ícone) */
  left: 50%; /* Começa no meio deste item */
  width: 100%; /* Vai até o meio do próximo item */
  height: 2px;
  background-color: #000;
  z-index: 0;
}

/* Remove a linha do último item */
.timeline-item:last-child::after {
  display: none;
}

/* --- ÍCONE --- */
.icon-box {
  background-color: #d3d3d3; /* Fundo igual a section para "cortar" a linha */
  z-index: 1;
  padding: 0 10px;
  margin-bottom: 10px;
  display: inline-block;
  position: relative;
}

.timeline-item .bi {
  font-size: 2rem;
  color: #000;
}

/* --- TEXTO --- */
.timeline-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #000;
  margin: 0 0 5px 0;
  line-height: 1.2;
  z-index: 1;
}

.timeline-date {
  font-size: 0.75rem;
  color: #333;
}

/* --- ESTADO ATIVO (Horizontal) --- */
.timeline-item.active .bi {
  transform: scale(1.2);
  font-weight: bold;
}

.timeline-item.active .timeline-title {
  font-weight: 800;
}
</style>