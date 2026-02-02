<template>
  <section class="timeline-section-coordinator">
    <div class="timeline-container">
      <div class="timeline-progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <div class="timeline-grid">
        <div 
          v-for="(step, index) in timelineSteps" 
          :key="index" 
          class="timeline-item" 
          :class="{ active: step.active, upcoming: isUpcoming(index), completed: isCompleted(index) }"
        >
          <div class="icon-wrapper">
            <div class="icon-box" :class="{ 'icon-active': step.active }">
              <i :class="['bi', step.icon]"></i>
            </div>
            <div v-if="step.active" class="pulse-ring"></div>
          </div>

          <h4 class="timeline-title">{{ step.label }}</h4>
          <span v-if="step.date" class="timeline-date">{{ step.date }}</span>
          <span v-if="step.active" class="status-badge">Atual</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { steps } from '@/stores/timelineData' 

const timelineSteps = ref(steps)

// Calcula o percentual de progresso baseado no índice do item ativo
const progressPercentage = computed(() => {
  const activeIndex = timelineSteps.value.findIndex(step => step.active)
  if (activeIndex === -1) return 0
  return ((activeIndex + 1) / timelineSteps.value.length) * 100
})

const isUpcoming = (index) => {
  const activeIndex = timelineSteps.value.findIndex(step => step.active)
  return index > activeIndex
}

const isCompleted = (index) => {
  const activeIndex = timelineSteps.value.findIndex(step => step.active)
  return index < activeIndex
}
</script>

<style scoped>
.timeline-section-coordinator {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  padding: 1.2rem 1rem;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: center;
  width: 100%;
}

.timeline-container {
  width: 100%;
  max-width: 1400px;
  position: relative;
}

/* --- BARRA DE PROGRESSO --- */
.timeline-progress-bar {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1.2rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #065f8b 0%, #0892d5 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
}

/* --- GRID DO TIMELINE --- */
.timeline-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  position: relative;
  padding: 0 0.5rem;
}

/* --- LINHA CONECTORA ENTRE ITEMS --- */
.timeline-grid::before {
  content: '';
  position: absolute;
  top: 30px;
  left: 3%;
  right: 3%;
  height: 2px;
  background: linear-gradient(90deg, #ddd 0%, #ddd 50%, transparent 50%, transparent 100%);
  z-index: 0;
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

/* --- ÍCONE --- */
.icon-wrapper {
  position: relative;
  margin-bottom: 0.6rem;
}

.icon-box {
  background-color: #ffffff;
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.icon-box i {
  font-size: 1.4rem;
  color: #666;
  transition: all 0.3s ease;
}

/* --- ITEM ATIVO (com ícone maior e azul) --- */
.timeline-item.active .icon-box {
  background: linear-gradient(135deg, #0892d5 0%, #065f8b 100%);
  border-color: #0892d5;
  width: 55px;
  height: 55px;
  box-shadow: 0 4px 12px rgba(8, 146, 213, 0.3);
  transform: scale(1.1);
}

.timeline-item.active .icon-box i {
  font-size: 1.9rem;
  color: #ffffff;
}

/* --- EFEITO PULSO PARA ITEM ATIVO --- */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 55px;
  height: 55px;
  background: transparent;
  border: 2px solid rgba(8, 146, 213, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    width: 55px;
    height: 55px;
    opacity: 1;
  }
  100% {
    width: 85px;
    height: 85px;
    opacity: 0;
  }
}

/* --- ITEMS COMPLETADOS --- */
.timeline-item.completed .icon-box {
  background-color: #e8f5e9;
  border-color: #4caf50;
}

.timeline-item.completed .icon-box i {
  color: #2e7d32;
}

/* --- ITEMS FUTUROS --- */
.timeline-item.upcoming .icon-box {
  background-color: #fafafa;
  border-color: #ccc;
}

.timeline-item.upcoming .icon-box i {
  color: #999;
}

/* --- TEXTO --- */
.timeline-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.2rem 0;
  line-height: 1.2;
  max-width: 80px;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-title {
  font-weight: 700;
  color: #0892d5;
  font-size: 0.8rem;
}

.timeline-date {
  font-size: 0.65rem;
  color: #666;
  margin-bottom: 0.2rem;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-date {
  color: #0892d5;
  font-weight: 600;
}

/* --- BADGE STATUS --- */
.status-badge {
  display: inline-block;
  background: linear-gradient(135deg, #0892d5 0%, #065f8b 100%);
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 1024px) {
  .timeline-grid {
    padding: 0;
  }

  .icon-box {
    width: 45px;
    height: 45px;
  }

  .icon-box i {
    font-size: 1.5rem;
  }

  .timeline-item.active .icon-box {
    width: 60px;
    height: 60px;
  }

  .timeline-item.active .icon-box i {
    font-size: 2rem;
  }

  .timeline-title {
    font-size: 0.75rem;
    max-width: 85px;
  }

  .timeline-date {
    font-size: 0.65rem;
  }
}

@media (max-width: 768px) {
  .timeline-section-coordinator {
    padding: 1.5rem 0.5rem;
  }

  .timeline-grid::before {
    display: none;
  }

  .timeline-item {
    flex: 0 0 calc(50% - 0.5rem);
    margin: 0.5rem;
  }

  .icon-box {
    width: 40px;
    height: 40px;
  }

  .icon-box i {
    font-size: 1.2rem;
  }

  .timeline-item.active .icon-box {
    width: 50px;
    height: 50px;
  }

  .timeline-item.active .icon-box i {
    font-size: 1.6rem;
  }

  .timeline-title {
    font-size: 0.7rem;
    max-width: 70px;
  }
}
</style>
