<template>
  <section class="timeline-section">
    <div class="timeline-grid" :class="{ vertical: vertical }">
      <div 
        v-for="(step, index) in timelineSteps" 
        :key="index" 
        class="timeline-item" 
        :class="{ active: step.active }"
      >
        <div class="icon-wrapper">
          <div class="icon-box">
            <i :class="['bi', step.icon]"></i>
          </div>
          <div class="connecting-line" v-if="index !== timelineSteps.length - 1"></div>
        </div>

        <div class="content-wrapper">
          <div class="timeline-content">
            <h4 class="timeline-title">{{ step.label }}</h4>
            <span v-if="step.date" class="timeline-date">{{ step.date }}</span>
          </div>

          <div class="arrow">→</div>

          <div class="info-box">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
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
  padding: 3rem 1rem;
  border-bottom: 1px solid #bcbcbc;
  display: flex;
  justify-content: center;
  width: 100%;
}

.timeline-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  gap: 1rem; /* Reduzi um pouco o gap pois o padding interno dos itens compensa */
}

/* Modo horizontal (padrão para perfis) */
.timeline-grid:not(.vertical) {
  flex-direction: column;
}

/* Modo vertical (para painel de informações) */
.timeline-grid.vertical {
  flex-direction: column;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  gap: 1.5rem;
  
  /* NOVOS ESTILOS DE ESTRUTURA */
  padding: 1.5rem; /* Espaçamento interno para o fundo não colar no texto */
  border-radius: 12px; /* Bordas arredondadas */
  transition: all 0.3s ease; /* Transição suave */
}

/* --- ESTADO ATIVO (Fundo Amarelo) --- */
.timeline-item.active {
  background-color: #fff9c4; /* Amarelo bem claro */
  border: 1px solid #fff59d; /* Borda sutil opcional */
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); /* Sombra leve para destacar */
}

/* Ajuste do título no estado ativo */
.timeline-item.active .timeline-title {
  font-weight: 900;
  color: #000;
}

/* Ajuste da caixa do ícone no estado ativo para combinar com o fundo */
.timeline-item.active .icon-box {
  background-color: #fff9c4; /* Mesma cor do fundo ativo */
  border: 2px solid #000; /* Destaque opcional no ícone */
}

/* --- Coluna do Ícone e Linha --- */
.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  flex-shrink: 0;
}

.icon-box {
  background-color: #d3d3d3; /* Cor padrão */
  z-index: 2;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  transition: background-color 0.3s ease;
}

.timeline-item .bi {
  font-size: 1.8rem;
  color: #000 !important;
  display: block;
}

/* Linha Conectora Vertical */
.connecting-line {
  width: 2px;
  background-color: #000;
  min-height: 60px;
  margin-top: 8px;
  /* A linha se estende para conectar visualmente apesar do padding */
  height: 100%; 
}

/* --- Coluna do Conteúdo --- */
.content-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  flex: 1;
  padding-top: 5px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  flex-shrink: 0;
}

.timeline-title {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.timeline-date {
  font-size: 0.85rem;
  color: #333;
  font-weight: normal;
}

.arrow {
  font-size: 1.5rem;
  color: #000;
  flex-shrink: 0;
}

/* --- Caixa de Informação --- */
.info-box {
  background-color: rgba(255, 255, 255, 0.6); /* Mais transparente */
  border: 1px solid #999;
  border-radius: 4px;
  padding: 1rem;
  font-size: 0.85rem;
  color: #333;
  line-height: 1.4;
  flex: 1;
}

.info-box p {
  margin: 0;
}
</style>