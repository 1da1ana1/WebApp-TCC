<template>
  <div class="page-wrapper">
    <div class="main-container">
      <div class="content-card">
        
        <nav class="tabs-navigation">
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'calendar' }"
            @click="currentTab = 'calendar'"
          >
            Calendário
          </button>
          
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'vacancies' }"
            @click="currentTab = 'vacancies'"
          >
            Definição de vagas
          </button>
          
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'contests' }"
            @click="currentTab = 'contests'"
          >
            Vagas contestadas
          </button>
          
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'stats' }"
            @click="currentTab = 'stats'"
          >
            Estatísticas
          </button>
        </nav>

        <main class="tab-content">
          
          <div v-if="currentTab === 'calendar'" class="view-calendar">
            <h2 class="view-title">Gerenciamento do Cronograma do Processo de TCC</h2>
            
            <div class="calendar-grid">
              <div class="date-group" v-for="item in cronogramaItems" :key="item.label">
                <label>{{ item.label }}</label>
                <div class="date-inputs">
                  <div class="input-wrapper">
                    <span>Start date</span>
                    <i class="bi bi-calendar"></i>
                  </div>
                  <span class="arrow">➝</span>
                  <div class="input-wrapper">
                    <span>End date</span>
                    <i class="bi bi-calendar"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-footer">
              <button class="btn-action btn-blue">Limpar</button>
              <button class="btn-action btn-gray">Editar</button>
              <button class="btn-action btn-green">Confirmar</button>
            </div>
          </div>

          <div v-else-if="currentTab === 'vacancies'" class="view-placeholder">
            <h3>Definição de Vagas</h3>
            <p>Tabela de gerenciamento de vagas dos docentes aqui.</p>
          </div>

          <div v-else-if="currentTab === 'contests'" class="view-placeholder">
            <h3>Vagas Contestadas</h3>
            <p>Lista de solicitações de contestação pendentes.</p>
          </div>

          <div v-else-if="currentTab === 'stats'" class="view-placeholder">
            <h3>Estatísticas Gerais</h3>
            <p>Gráficos e KPIs do processo.</p>
          </div>

        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estado da Aba Atual
const currentTab = ref('calendar')

// Dados Mockados para o Calendário (Visual)
const cronogramaItems = ref([
  { label: 'Definição de vagas' },
  { label: 'Início das orientações' },
  { label: 'Homologação e análise' },
  { label: 'Análise das solicitações' },
  { label: 'Encerramento do período de buscas' },
  { label: 'Período de busca e solicitação' },
  { label: 'Confirmação do vínculo' },
])
</script>

<style scoped>
/* --- LAYOUT GERAL --- */
.page-wrapper {
  background-color: #e0e0e0; /* Fundo cinza da página */
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.main-container {
  width: 100%;
  max-width: 1200px;
  margin-top: 2rem;
}

.content-card {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0; /* Padding controlado internamente */
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

/* --- NAVEGAÇÃO (ABS) --- */
.tabs-navigation {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 2rem 2rem 0 2rem;
  border-bottom: 1px solid transparent; /* Espaço reservado */
}

.tab-btn {
  background: none;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: #666;
  padding-bottom: 10px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: var(--color-brand-primary);
}

.tab-btn.active {
  color: var(--color-brand-primary, #005b8e);
  font-weight: 500;
  border-bottom: 3px solid var(--color-brand-primary, #005b8e);
}

/* --- CONTEÚDO --- */
.tab-content {
  padding: 2rem 4rem;
  flex: 1;
}

.view-title {
  text-align: center;
  font-weight: 500;
  margin-bottom: 3rem;
  color: #000;
  font-size: 1.5rem;
}

/* --- ESTILOS DO CALENDÁRIO (MOCK VISUAL) --- */
.calendar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem 4rem;
  margin-bottom: 3rem;
}

.date-group label {
  display: block;
  font-weight: 600;
  font-style: italic;
  margin-bottom: 0.5rem;
  color: #000;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.input-wrapper {
  border: 2px solid #aabcfc; /* Azul claro da imagem */
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 180px;
  color: #666;
  font-size: 0.9rem;
  background: #fff;
}

.arrow {
  color: #666;
  font-weight: bold;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn-action {
  padding: 10px 30px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  font-family: 'Poppins', sans-serif;
}

.btn-blue { background-color: #065f8b; }
.btn-gray { background-color: #808080; }
.btn-green { background-color: #53b57c; }

/* Placeholder para outras abas */
.view-placeholder {
  text-align: center;
  padding: 4rem;
  color: #666;
}

@media (max-width: 768px) {
  .tabs-navigation {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .calendar-grid {
    grid-template-columns: 1fr;
  }
}
</style>