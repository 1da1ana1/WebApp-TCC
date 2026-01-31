<template>
  <div class="statistics-view">
    <h2 class="view-title">Estatísticas e Monitoramento</h2>

    <div class="stats-container-border">
      
      <nav class="sub-tabs-nav">
        <button 
          :class="{ active: currentStatsTab === 'overview' }" 
          @click="currentStatsTab = 'overview'">Visão Geral</button>
        <button 
          :class="{ active: currentStatsTab === 'funnel' }" 
          @click="currentStatsTab = 'funnel'">Funil de Vinculação</button>
        <button 
          :class="{ active: currentStatsTab === 'risks' }" 
          @click="currentStatsTab = 'risks'">Riscos & Gargalos</button>
      </nav>

      <div class="stats-inner-content">
        
        <div v-if="currentStatsTab === 'overview'" class="sub-view-overview">
          <div class="overview-grid">
            
            <div class="stat-gray-card left">
              <div class="card-header-row">
                <h4>Saúde do Processo</h4>
                <span class="badge-status warning">Atenção Necessária</span>
              </div>
              
              <div class="kpi-list">
                <div class="kpi-item">
                  <span class="kpi-label">Total de Alunos Matriculados</span>
                  <span class="kpi-value">45</span>
                </div>
                
                <div class="kpi-item">
                  <span class="kpi-label">Vagas Totais Ofertadas</span>
                  <span class="kpi-value text-danger">40 <i class="bi bi-exclamation-circle-fill" title="Déficit de 5 vagas!"></i></span>
                </div>

                <div class="divider-line"></div>

                <div class="kpi-item highlight-risk">
                  <span class="kpi-label">Alunos SEM Orientador (Risco)</span>
                  <span class="kpi-value text-danger">15</span>
                </div>

                <div class="kpi-item">
                  <span class="kpi-label">Docentes com vagas sobrando</span>
                  <span class="kpi-value text-success">4</span>
                </div>
              </div>

              <div class="card-footer-actions">
                <button class="btn-export-yellow">Baixar relatório de alunos sem vínculo</button>
              </div>
            </div>

            <div class="stat-gray-card right">
              <h4>Prazo da Etapa Atual</h4>
              <p class="phase-label">Fase: <strong>Solicitação de Vagas</strong></p>
              
              <div class="calendar-widget-mock">
                <div class="cal-header">
                  <div class="cal-title">Outubro 2025</div>
                  <div class="cal-status">Restam <strong>5 dias</strong></div>
                </div>
                <div class="cal-weekdays">
                  <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                </div>
                <div class="cal-days">
                  <span class="muted">29</span><span class="muted">30</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                  <span>13</span><span>14</span><span class="range-start">15</span><span class="range-mid">16</span><span class="range-mid">17</span><span class="range-mid">18</span><span class="range-mid">19</span>
                  <span class="range-end">20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
                  <span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span class="muted">1</span><span class="muted">2</span>
                </div>
              </div>

              <div class="card-footer-actions">
                <button class="btn-action-outline">Estender prazo (+2 dias)</button>
              </div>
            </div>

          </div>
        </div>

        <div v-else-if="currentStatsTab === 'funnel'" class="sub-view-charts">
          <div class="charts-grid">
            
            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Interesse por Área</h5>
                  <small>Onde os alunos estão focando?</small>
                </div>
              </div>
              <div class="main-metric">IA e Machine Learning</div>
              <div class="chart-visual donut-container">
                <div class="donut-chart"></div>
                <div class="legend">
                  <span><i class="dot blue"></i> Inteligência Artificial (45%)</span>
                  <span><i class="dot purple"></i> Web Development (35%)</span>
                  <span><i class="dot pink"></i> Segurança (20%)</span>
                </div>
              </div>
            </div>

            <div class="chart-card wide">
              <div class="chart-header">
                <h5>Funil de Vinculação</h5>
                <small>Progresso dos alunos no processo</small>
              </div>
              
              <div class="funnel-visual">
                <div class="funnel-step">
                  <div class="step-bar step-1">100%</div>
                  <span class="step-label">Total Alunos (45)</span>
                </div>
                <div class="funnel-step">
                  <div class="step-bar step-2">80%</div>
                  <span class="step-label">Enviaram Solicitação (36)</span>
                </div>
                <div class="funnel-step">
                  <div class="step-bar step-3">66%</div>
                  <span class="step-label">Vinculados (30)</span>
                </div>
              </div>
              
              <div class="chart-legend-bottom mt-2">
                <span class="text-danger"><i class="bi bi-exclamation-triangle"></i> 9 alunos ainda não iniciaram!</span>
              </div>
            </div>

          </div>
        </div>

        <div v-else-if="currentStatsTab === 'risks'" class="sub-view-charts">
          <div class="charts-grid">
            
            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Vagas "Encalhadas"</h5>
                  <small>Docentes com baixa procura</small>
                </div>
              </div>
              <div class="chart-visual bar-container">
                <div class="bars-wrapper align-bottom">
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-green" style="height: 80%"></div>
                    <span>Prof. A</span>
                  </div>
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-green" style="height: 60%"></div>
                    <span>Prof. B</span>
                  </div>
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-green" style="height: 30%"></div>
                    <span>Prof. C</span>
                  </div>
                </div>
              </div>
              <div class="chart-advice">
                <small>Sugestão: Incentivar alunos a procurarem estas áreas.</small>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h5>Docentes Sobrecarregados</h5>
                  <small>Maior nº de recusas enviadas</small>
                </div>
              </div>
              <div class="chart-visual bar-container">
                <div class="bars-wrapper align-bottom">
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-red" style="height: 90%"></div>
                    <span>Prof. X</span>
                  </div>
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-red" style="height: 70%"></div>
                    <span>Prof. Y</span>
                  </div>
                  <div class="bar-group-labeled">
                    <div class="bar-fat bg-red" style="height: 40%"></div>
                    <span>Prof. Z</span>
                  </div>
                </div>
              </div>
              <div class="chart-advice">
                <small>Estes docentes receberam muito mais solicitações do que vagas.</small>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 'overview', 'funnel', 'risks'
const currentStatsTab = ref('overview')
</script>

<style scoped>
.statistics-view {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.view-title { 
  text-align: center; 
  font-weight: 600; 
  margin-bottom: 2rem; 
  color: #1a1a1a; 
  font-size: 1.5rem; 
}

.stats-container-border {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0;
  background: #fff;
}

/* --- ABAS INTERNAS --- */
.sub-tabs-nav {
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.sub-tabs-nav button {
  background: none;
  border: none;
  padding-bottom: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.2s;
}

.sub-tabs-nav button.active {
  color: var(--color-brand-primary, #065f8b);
  border-bottom-color: var(--color-brand-primary, #065f8b);
  font-weight: 600;
}

.stats-inner-content {
  padding: 0 2rem 2rem;
}

/* --- VISÃO GERAL (KPIs) --- */
.overview-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
}

.stat-gray-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.card-header-row h4 { margin: 0; font-size: 1.1rem; color: #333; }

.badge-status.warning {
  background-color: #fff3cd; color: #856404;
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}

.kpi-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.kpi-label { color: #555; font-size: 0.95rem; }
.kpi-value { font-weight: 700; font-size: 1.1rem; color: #000; }

.text-danger { color: #dc3545 !important; }
.text-success { color: #28a745 !important; }

.divider-line { height: 1px; background: #ddd; margin: 0.5rem 0; }

.highlight-risk {
  background-color: #ffebee;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
}

/* Botões */
.btn-export-yellow {
  background-color: #ffc107;
  border: none; padding: 10px; border-radius: 6px;
  font-weight: 600; cursor: pointer; width: 100%;
  margin-top: 1rem; color: #000;
}
.btn-action-outline {
  background: transparent; border: 1px solid #065f8b;
  color: #065f8b; padding: 8px; border-radius: 6px;
  cursor: pointer; width: 100%; font-weight: 500;
}

/* Calendário Miniatura */
.calendar-widget-mock {
  background: white; border: 1px solid #eee; border-radius: 8px; padding: 1rem;
  margin: 1rem 0;
}
.cal-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
.cal-status { color: #e67e22; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.7rem; color: #888; margin-bottom: 5px; }
.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 0.8rem; }
.cal-days span { padding: 4px 0; }
.cal-days span.muted { color: #ddd; }
.range-start { background: #065f8b; color: white; border-radius: 4px 0 0 4px; }
.range-mid { background: #d0e8f7; color: #065f8b; }
.range-end { background: #065f8b; color: white; border-radius: 0 4px 4px 0; }

/* --- GRÁFICOS E FUNIL --- */
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.chart-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; }
.chart-card.wide { grid-column: span 2; } /* Ocupa 2 colunas se possível */

.chart-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.chart-header h5 { margin: 0; font-size: 1rem; color: #333; }
.chart-header small { color: #777; font-size: 0.8rem; }

/* Funil Visual (CSS Puro) */
.funnel-visual { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
.funnel-step { display: flex; align-items: center; gap: 10px; }
.step-bar {
  background: linear-gradient(90deg, #065f8b, #63a4ff);
  color: white; font-size: 0.75rem; font-weight: bold;
  padding: 6px 10px; border-radius: 0 4px 4px 0;
  display: flex; align-items: center;
}
.step-1 { width: 100%; background: #065f8b; }
.step-2 { width: 80%; background: #4a90e2; }
.step-3 { width: 66%; background: #53b57c; } /* Verde para sucesso */
.step-label { font-size: 0.85rem; color: #555; }

/* Donut e Barras (Simplificados) */
.chart-visual { height: 150px; display: flex; align-items: center; justify-content: center; position: relative; }
.donut-chart { width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(#065f8b 0% 45%, #63a4ff 45% 80%, #d8b4fe 80% 100%); position: relative; }
.donut-chart::after { content: ""; position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; background: #f8f9fa; border-radius: 50%; }
.legend { font-size: 0.75rem; display: flex; flex-direction: column; gap: 4px; margin-left: 1rem; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.dot.blue { background: #065f8b; } .dot.purple { background: #63a4ff; } .dot.pink { background: #d8b4fe; }

/* Barras Labeled */
.bar-container { width: 100%; padding: 0 20px; }
.bars-wrapper { display: flex; justify-content: space-around; height: 100%; align-items: flex-end; width: 100%; }
.bar-group-labeled { display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end; width: 30px; }
.bar-fat { width: 100%; border-radius: 4px 4px 0 0; }
.bg-green { background-color: #53b57c; }
.bg-red { background-color: #dc3545; }
.bar-group-labeled span { font-size: 0.7rem; color: #666; }

.chart-advice { margin-top: 1rem; font-style: italic; color: #777; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 4px; }

@media (max-width: 900px) {
  .overview-grid, .charts-grid { grid-template-columns: 1fr; }
  .chart-card.wide { grid-column: span 1; }
  .sub-tabs-nav { flex-wrap: wrap; gap: 1rem; }
}
</style>