<template>
  <div class="page-wrapper">
    <div class="main-container">
      <div class="content-card">
        
        <nav class="tabs-navigation">
          <button class="tab-btn" :class="{ active: currentTab === 'calendar' }" @click="currentTab = 'calendar'">Calendário</button>
          <button class="tab-btn" :class="{ active: currentTab === 'vacancies' }" @click="currentTab = 'vacancies'">Definição de vagas</button>
          <button class="tab-btn" :class="{ active: currentTab === 'contests' }" @click="currentTab = 'contests'">Vagas contestadas</button>
          <button class="tab-btn" :class="{ active: currentTab === 'stats' }" @click="currentTab = 'stats'">Estatísticas</button>
        </nav>

        <main class="tab-content">
          <CalendarPanel v-if="currentTab === 'calendar'" />
          <VacanciesPanel
            v-else-if="currentTab === 'vacancies'"
            :selected-professors="selectedProfessors"
            @update:selected-professors="selectedProfessors = $event"
          />
          <ContestsPanel v-else-if="currentTab === 'contests'" @accepted="handleContestAccepted" />
          <StatsPanel v-else-if="currentTab === 'stats'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CalendarPanel from './painel/CalendarPanel.vue'
import VacanciesPanel from './painel/VacanciesPanel.vue'
import ContestsPanel from './painel/ContestsPanel.vue'
import StatsPanel from './painel/StatsPanel.vue'

const currentTab = ref('calendar')
const selectedProfessors = ref([
  { id: '123456', name: 'Prof. Dr. Ana Souza', area: 'Inteligência Artificial' },
  { id: '789012', name: 'Prof. Carlos Oliveira', area: 'Engenharia de Software' },
  { id: '345678', name: 'Profa. Mariana Lima', area: 'Redes de Computadores' }
])

const handleContestAccepted = (contest) => {
  currentTab.value = 'vacancies'
  const exists = selectedProfessors.value.find(p => p.id === contest.id)
  if (!exists) {
    selectedProfessors.value.unshift({ id: contest.id, name: contest.name, area: 'Contestação Aceita' })
  }
}
</script>

<style scoped>
/* --- LAYOUT GERAL & TABS --- */
.page-wrapper { background-color: #f0f2f5; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; align-items: flex-start; font-family: 'Poppins', sans-serif; }
.main-container { width: 100%; max-width: 1200px; margin-top: 2rem; }
.content-card { background-color: #ffffff; border-radius: 12px; padding: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.08); min-height: 650px; display: flex; flex-direction: column; overflow: hidden; }
.tabs-navigation { display: flex; justify-content: center; gap: 2.5rem; padding: 2rem 2rem 0 2rem; background: #fafafa; border-bottom: 1px solid #e0e0e0; }
.tab-btn { background: none; border: none; font-family: 'Poppins', sans-serif; font-size: 1.05rem; color: #777; padding-bottom: 12px; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s ease; font-weight: 500; }
.tab-btn:hover { color: var(--color-brand-primary, #065f8b); }
.tab-btn.active { color: var(--color-brand-primary, #065f8b); font-weight: 600; border-bottom: 3px solid var(--color-brand-primary, #065f8b); }
.tab-content { padding: 3rem 4rem; flex: 1; }
@media (max-width: 900px) {
  .tab-content { padding: 2rem; }
}
</style>