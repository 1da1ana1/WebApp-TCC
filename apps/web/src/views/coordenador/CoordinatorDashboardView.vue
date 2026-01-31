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
          
          <div v-if="currentTab === 'calendar'" class="view-calendar">
            <h2 class="view-title">Gerenciamento do Cronograma do Processo de TCC</h2>
            
            <div class="calendar-grid">
              <div class="date-group" v-for="item in cronogramaItems" :key="item.label">
                <label>{{ item.label }}</label>
                <div class="date-inputs">
                  <div class="input-wrapper">
                    <input 
                      type="date" 
                      v-model="item.startDate"
                      class="date-input"
                    />
                    <i class="bi bi-calendar"></i>
                  </div>
                  <span class="arrow">➝</span>
                  <div class="input-wrapper">
                    <input 
                      type="date" 
                      v-model="item.endDate"
                      class="date-input"
                    />
                    <i class="bi bi-calendar"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-footer">
              <button class="btn-action btn-blue" @click="limparDatas">Limpar</button>
              <button class="btn-action btn-gray" @click="editarDatas">Editar</button>
              <button class="btn-action btn-green" @click="confirmarDatas">Confirmar</button>
            </div>
          </div>

          <div v-else-if="currentTab === 'vacancies'" class="view-vacancies">
            <h2 class="view-title">Definição de vagas</h2>

            <div class="vacancies-board">
              
              <div class="section-global">
                <h3 class="section-subtitle">Configuração Global</h3>
                <div class="controls-row-global">
                  
                  <div class="control-group">
                    <label>Quantidade padrão de vagas</label>
                    <div class="modern-stepper">
                      <button class="stepper-btn minus" @click="globalCount > 0 ? globalCount-- : 0">
                        <i class="bi bi-dash-lg"></i>
                      </button>
                      <input type="number" v-model="globalCount" readonly class="stepper-input">
                      <button class="stepper-btn plus" @click="globalCount++">
                        <i class="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>

                  <label class="checkbox-container">
                    <input type="checkbox" v-model="applyAll">
                    <span class="checkmark"></span>
                    <span class="label-text">Aplicar esta quantidade para <strong>todos</strong> os docentes inicialmente</span>
                  </label>
                </div>

                <div class="action-row right mt-3">
                  <button class="btn-confirm" @click="saveGlobal">
                    <i class="bi bi-check2-circle"></i> Aplicar Globalmente
                  </button>
                </div>
              </div>

              <div class="section-divider"></div>

              <div class="section-specific">
                <div class="specific-layout">
                  
                  <div class="specific-left">
                    <h3 class="section-subtitle mb-4">Ajuste Específico por Docente</h3>
                    
                    <div class="form-group mb-4">
                      <label class="field-label">Buscar docente</label>
                      <div class="modern-search-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" placeholder="Digite o nome ou ID..." v-model="searchQuery">
                        <button class="btn-search-action" title="Adicionar à lista">
                          <i class="bi bi-arrow-right-short"></i>
                        </button>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="field-label">Quantidade de vagas para os selecionados</label>
                      <div class="modern-stepper mr-auto">
                        <button class="stepper-btn minus" @click="specificCount > 0 ? specificCount-- : 0">
                          <i class="bi bi-dash-lg"></i>
                        </button>
                        <input type="number" v-model="specificCount" readonly class="stepper-input">
                        <button class="stepper-btn plus" @click="specificCount++">
                          <i class="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="specific-right">
                    <div class="list-header">
                      <span class="list-title">Docentes Selecionados ({{ selectedProfessors.length }})</span>
                      <button class="btn-clear-all" v-if="selectedProfessors.length > 0" @click="selectedProfessors = []">Limpar tudo</button>
                    </div>
                    
                    <div class="selected-professors-list custom-scrollbar">
                      <div v-for="prof in selectedProfessors" :key="prof.id" class="prof-card-item">
                        <div class="prof-avatar-container">
                           <i class="bi bi-person-circle prof-avatar-icon"></i>
                        </div>
                        
                        <div class="prof-info">
                          <span class="prof-name">{{ prof.name }}</span>
                          <span class="prof-details">{{ prof.area }} • ID: {{ prof.id }}</span>
                        </div>
                        
                        <button class="btn-remove-card" @click="removeProf(prof.id)" title="Remover da lista">
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>

                      <div v-if="selectedProfessors.length === 0" class="empty-list-state">
                        <i class="bi bi-people"></i>
                        <p>Nenhum docente selecionado.</p>
                      </div>
                    </div>
                    
                    <div class="action-row right mt-3">
                       <button class="btn-confirm btn-confirm-specific" :disabled="selectedProfessors.length === 0" @click="saveSpecific">
                        Atualizar Selecionados
                       </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <div v-else-if="currentTab === 'contests'" class="view-contests">
            <h2 class="view-title">Vagas contestadas</h2>
            
            <div class="contests-table-container">
              <div class="contest-header-row">
                <div class="col-docente">Docente</div>
                <div class="col-justificativa">Justificativa</div>
                <div class="col-situacao">Situação</div>
              </div>

              <div class="contest-list">
                <div v-for="contest in contestsList" :key="contest.id" class="contest-row">
                  
                  <div class="col-docente">
                    <div class="contest-avatar">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="contest-info">
                      <span class="contest-name">{{ contest.name }}</span>
                      <span class="contest-id">{{ contest.id }}</span>
                    </div>
                  </div>

                  <div class="col-justificativa">
                    <div class="reason-box">
                      {{ contest.reason }}
                    </div>
                  </div>

                  <div class="col-situacao">
                    <div v-if="contest.status === 'pending'" class="contest-actions">
                      <button class="btn-contest-action btn-accept" @click="openAcceptContest(contest)">Aceitar</button>
                      <button class="btn-contest-action btn-reject" @click="openRejectContest(contest)">Recusar</button>
                    </div>
                    
                    <div v-else class="contest-status-badge" :class="contest.status">
                      <span>{{ contest.status === 'accepted' ? 'Aceita' : 'Recusada' }}</span>
                      <button class="btn-dismiss" @click="removeContest(contest.id)"><i class="bi bi-x-square"></i></button>
                    </div>
                  </div>

                </div>

                <div v-if="contestsList.length === 0" class="empty-list-state">
                  <i class="bi bi-inbox"></i>
                  <p>Nenhuma contestação pendente.</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'stats'" class="view-placeholder">
            <h3>Estatísticas Gerais</h3>
            <p>Gráficos e KPIs do processo.</p>
          </div>

        </main>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-card">
        <h3>Por favor, insira a justificativa da recusa:</h3>
        <div class="modal-form">
          <label>Selecione um motivo:</label>
          <select v-model="rejectReason" class="modal-select">
            <option value="" disabled selected>Selecione...</option>
            <option value="Justificativa insuficiente">Justificativa insuficiente</option>
            <option value="Sem saldo de vagas">Sem saldo de vagas no curso</option>
            <option value="Fora do prazo">Solicitação fora do prazo</option>
            <option value="Outro">Outro motivo não listado</option>
          </select>
          <div class="textarea-container">
            <label>Detalhes (Opcional se selecionar motivo):</label>
            <textarea v-model="rejectCustomReason" placeholder="Digite a justificativa..." rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="closeRejectModal">Cancelar</button>
          <button class="btn-modal-confirm" @click="confirmRejectAction">Enviar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const currentTab = ref('calendar') // Inicializando em CALENDAR para ver os itens

// --- LÓGICA DO CALENDÁRIO (ITENS RESTAURADOS) ---
const cronogramaItems = ref([
  { label: 'Definição de vagas', startDate: '', endDate: '' },
  { label: 'Início das orientações', startDate: '', endDate: '' },
  { label: 'Homologação e análise', startDate: '', endDate: '' },
  { label: 'Análise das solicitações', startDate: '', endDate: '' },
  { label: 'Encerramento do período de buscas', startDate: '', endDate: '' },
  { label: 'Período de busca e solicitação', startDate: '', endDate: '' },
  { label: 'Confirmação do vínculo', startDate: '', endDate: '' },
])

const limparDatas = () => {
  cronogramaItems.value.forEach(item => { item.startDate = ''; item.endDate = '' })
  Swal.fire({ icon: 'success', title: 'Datas limpas', timer: 1500, showConfirmButton: false })
}

const editarDatas = () => {
  Swal.fire({ icon: 'info', title: 'Modo de edição', text: 'Você pode editar as datas diretamente nos campos.', confirmButtonColor: '#065f8b' })
}

const confirmarDatas = () => {
  const algumVazio = cronogramaItems.value.some(i => !i.startDate || !i.endDate)
  if (algumVazio) {
    Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todas as datas antes de confirmar.' })
    return
  }
  Swal.fire({ icon: 'success', title: 'Cronograma Salvo', confirmButtonColor: '#53b57c' })
}

// --- LÓGICA DE DEFINIÇÃO DE VAGAS ---
const globalCount = ref(5)
const applyAll = ref(true)
const specificCount = ref(3)
const searchQuery = ref('')

const selectedProfessors = ref([
  { id: '123456', name: 'Prof. Dr. Ana Souza', area: 'Inteligência Artificial' },
  { id: '789012', name: 'Prof. Carlos Oliveira', area: 'Engenharia de Software' },
  { id: '345678', name: 'Profa. Mariana Lima', area: 'Redes de Computadores' },
])

const removeProf = (id) => {
  const index = selectedProfessors.value.findIndex(p => p.id === id)
  if (index !== -1) selectedProfessors.value.splice(index, 1)
}

const saveGlobal = () => {
  Swal.fire({
    icon: 'success',
    title: 'Aplicado Globalmente',
    text: `Todas as vagas foram redefinidas para ${globalCount.value}.`,
    confirmButtonColor: '#53b57c',
    timer: 2000
  })
}

const saveSpecific = () => {
  if (selectedProfessors.value.length === 0) return;
  Swal.fire({
    icon: 'success',
    title: 'Atualização Específica',
    text: `Vagas atualizadas para ${selectedProfessors.value.length} docentes.`,
    confirmButtonColor: '#065f8b',
    timer: 2000
  })
}

// --- LÓGICA VAGAS CONTESTADAS ---
const contestsList = ref([
  { id: '123456', name: 'Lorem Ipsum Dolor Siamet', reason: 'Necessito de mais 2 vagas pois tenho alunos de IC iniciando.', status: 'pending' },
  { id: '123457', name: 'Lorem Ipsum Dolor Siamet', reason: 'Erro na contagem inicial, preciso de correção.', status: 'pending' },
  { id: '123458', name: 'Lorem Ipsum Dolor Siamet', reason: 'Solicito aumento de cota.', status: 'pending' },
  { id: '123459', name: 'Lorem Ipsum Dolor Siamet', reason: 'Vagas preenchidas, solicito extra.', status: 'accepted' },
  { id: '123460', name: 'Lorem Ipsum Dolor Siamet', reason: 'Sem justificativa plausível.', status: 'rejected' }
])

const showRejectModal = ref(false)
const activeContestItem = ref(null)
const rejectReason = ref('')
const rejectCustomReason = ref('')

const openAcceptContest = (contest) => {
  Swal.fire({
    title: 'Solicitação aceita com sucesso!',
    text: 'Você está sendo redirecionado para a página de Definição de vagas para realizar o ajuste.',
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    willClose: () => {
      contest.status = 'accepted'
      currentTab.value = 'vacancies'
      const exists = selectedProfessors.value.find(p => p.id === contest.id)
      if (!exists) {
        selectedProfessors.value.unshift({ id: contest.id, name: contest.name, area: 'Contestação Aceita' })
      }
    }
  })
}

const openRejectContest = (contest) => {
  activeContestItem.value = contest
  rejectReason.value = ''
  rejectCustomReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  activeContestItem.value = null
}

const confirmRejectAction = () => {
  if (activeContestItem.value) {
    activeContestItem.value.status = 'rejected'
    Swal.fire({
      icon: 'info',
      title: 'Contestação Recusada',
      text: 'A justificativa foi enviada ao docente.',
      timer: 1500,
      showConfirmButton: false
    })
  }
  closeRejectModal()
}

const removeContest = (id) => {
  contestsList.value = contestsList.value.filter(c => c.id !== id)
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
.view-title { text-align: center; font-weight: 600; margin-bottom: 3rem; color: #1a1a1a; font-size: 1.75rem; letter-spacing: -0.5px; }
.view-placeholder { text-align: center; padding: 4rem; color: #999; font-style: italic; }

/* --- CALENDÁRIO --- */
.calendar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 4rem; margin-bottom: 3rem; }
.date-group label { display: block; font-weight: 600; font-style: italic; margin-bottom: 0.5rem; color: #000; }
.date-inputs { display: flex; align-items: center; gap: 1rem; }
.input-wrapper { border: 2px solid #aabcfc; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; width: 180px; color: #666; font-size: 0.9rem; background: #fff; position: relative; }
.date-input { border: none; outline: none; font-family: 'Poppins', sans-serif; font-size: 0.9rem; color: #333; width: 100%; background: transparent; cursor: pointer; }
.date-input::-webkit-calendar-picker-indicator { position: absolute; left: 0; right: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.input-wrapper i { pointer-events: none; color: #aabcfc; }
.arrow { color: #666; font-weight: bold; }
.action-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }
.btn-action { padding: 10px 30px; border: none; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer; color: white; font-family: 'Poppins', sans-serif; }
.btn-blue { background-color: #065f8b; } .btn-gray { background-color: #808080; } .btn-green { background-color: #53b57c; }

/* --- DEFINIÇÃO DE VAGAS --- */
.section-subtitle { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 1.5rem; display: flex; align-items: center; }
.section-subtitle::before { content: ''; display: inline-block; width: 4px; height: 18px; background-color: var(--color-brand-primary, #065f8b); margin-right: 10px; border-radius: 2px; }
.section-divider { height: 1px; background-color: #e0e0e0; margin: 2.5rem 0; }
.controls-row-global { display: flex; align-items: center; gap: 3rem; background-color: #f8f9fa; padding: 1.5rem 2rem; border-radius: 10px; border: 1px solid #eef0f2; }
.control-group label { display: block; font-weight: 500; color: #555; margin-bottom: 0.8rem; font-size: 0.95rem; }
.modern-stepper { display: flex; align-items: center; background-color: #fff; border: 2px solid #e0e0e0; border-radius: 30px; overflow: hidden; width: fit-content; transition: border-color 0.3s ease; }
.modern-stepper:focus-within { border-color: var(--color-brand-primary, #065f8b); }
.stepper-btn { width: 40px; height: 40px; background-color: transparent; color: var(--color-brand-primary, #065f8b); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: background 0.2s; }
.stepper-btn:hover { background-color: #f0f7ff; }
.stepper-btn.minus { border-right: 1px solid #e0e0e0; } .stepper-btn.plus { border-left: 1px solid #e0e0e0; }
.stepper-input { width: 60px; height: 40px; text-align: center; border: none; font-weight: 600; font-size: 1.1rem; color: #333; outline: none; background: transparent; -moz-appearance: textfield; }
.stepper-input::-webkit-outer-spin-button, .stepper-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.checkbox-container { display: flex; align-items: center; position: relative; padding-left: 32px; margin-bottom: 0; cursor: pointer; font-size: 0.95rem; user-select: none; color: #555; }
.checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark { position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 22px; width: 22px; background-color: #fff; border: 2px solid #d0d0d0; border-radius: 6px; transition: all 0.2s ease; }
.checkbox-container:hover input ~ .checkmark { border-color: var(--color-brand-primary, #065f8b); }
.checkbox-container input:checked ~ .checkmark { background-color: var(--color-brand-primary, #065f8b); border-color: transparent; }
.checkmark:after { content: ""; position: absolute; display: none; }
.checkbox-container input:checked ~ .checkmark:after { display: block; }
.checkbox-container .checkmark:after { left: 7px; top: 3px; width: 6px; height: 12px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.label-text strong { color: #333; font-weight: 600; }
.action-row { display: flex; width: 100%; }
.action-row.right { justify-content: flex-end; }
.mt-3 { margin-top: 1.5rem; } .mb-4 { margin-bottom: 1.5rem; }
.btn-confirm { background-color: #53b57c; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(83, 181, 124, 0.2); }
.btn-confirm:hover { background-color: #46a06c; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(83, 181, 124, 0.3); }
.btn-confirm:active { transform: translateY(0); }
.btn-confirm-specific { background-color: var(--color-brand-primary, #065f8b); box-shadow: 0 2px 4px rgba(6, 95, 139, 0.2); }
.btn-confirm-specific:hover { background-color: #004b75; box-shadow: 0 4px 8px rgba(6, 95, 139, 0.3); }
.btn-confirm:disabled { background-color: #ccc; cursor: not-allowed; box-shadow: none; transform: none; }
.specific-layout { display: flex; gap: 4rem; }
.specific-left { flex: 1; }
.specific-right { flex: 1.2; display: flex; flex-direction: column; }
.field-label { display: block; font-weight: 500; color: #555; margin-bottom: 0.8rem; font-size: 0.95rem; }
.modern-search-wrapper { display: flex; align-items: center; border: 2px solid #e0e0e0; border-radius: 10px; padding: 6px 8px 6px 16px; background: white; width: 100%; transition: all 0.3s ease; }
.modern-search-wrapper:focus-within { border-color: var(--color-brand-primary, #065f8b); box-shadow: 0 0 0 3px rgba(6, 95, 139, 0.1); }
.search-icon { color: #aaa; margin-right: 12px; font-size: 1.1rem; }
.modern-search-wrapper input { border: none; outline: none; flex: 1; font-family: 'Poppins', sans-serif; font-size: 0.95rem; color: #333; }
.modern-search-wrapper input::placeholder { color: #bbb; }
.btn-search-action { background: var(--color-brand-primary, #065f8b); border: none; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; font-size: 1.3rem; transition: background 0.2s; }
.btn-search-action:hover { background-color: #004b75; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.list-title { font-weight: 600; color: #333; font-size: 1rem; }
.btn-clear-all { background: none; border: none; color: #dc3545; font-size: 0.85rem; cursor: pointer; font-weight: 500; }
.btn-clear-all:hover { text-decoration: underline; }
.selected-professors-list { display: flex; flex-direction: column; gap: 0.8rem; max-height: 350px; overflow-y: auto; padding-right: 5px; }
.prof-card-item { display: flex; align-items: center; gap: 1rem; background: #ffffff; padding: 12px 16px; border-radius: 10px; border: 1px solid #eef0f2; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition: all 0.2s ease; }
.prof-card-item:hover { border-color: #d0d7de; box-shadow: 0 4px 8px rgba(0,0,0,0.05); transform: translateX(2px); }
.prof-avatar-container { flex-shrink: 0; }
.prof-avatar-icon { font-size: 2.5rem; color: #bdbdbd; }
.prof-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.prof-name { font-weight: 600; font-size: 0.95rem; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prof-details { font-size: 0.8rem; color: #777; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-remove-card { width: 32px; height: 32px; background: transparent; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #aaa; font-size: 1rem; transition: all 0.2s; flex-shrink: 0; }
.btn-remove-card:hover { background-color: #ffebee; color: #dc3545; }
.empty-list-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: #aaa; border: 2px dashed #e0e0e0; border-radius: 10px; }
.empty-list-state i { font-size: 2.5rem; margin-bottom: 1rem; color: #ccc; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbb; }

/* --- ESTILOS VAGAS CONTESTADAS --- */
.contests-table-container { margin-top: 1rem; }
.contest-header-row { display: grid; grid-template-columns: 3fr 4fr 2fr; gap: 2rem; padding: 0 1rem 1rem 1rem; border-bottom: 2px solid #000; font-weight: 800; font-style: italic; color: #000; font-size: 0.95rem; }
.contest-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; max-height: 450px; overflow-y: auto; }
.contest-row { display: grid; grid-template-columns: 3fr 4fr 2fr; gap: 2rem; align-items: center; padding: 1rem; border-bottom: 1px solid #e0e0e0; }
.col-docente { display: flex; align-items: center; gap: 1rem; }
.contest-avatar { width: 40px; height: 40px; background-color: #1e1e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0; }
.contest-info { display: flex; flex-direction: column; }
.contest-name { font-weight: 600; font-size: 0.85rem; color: #000; }
.contest-id { font-size: 0.75rem; color: #555; }
.reason-box { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; font-size: 0.85rem; color: #555; background: #fff; min-height: 40px; display: flex; align-items: center; }
.contest-actions { display: flex; gap: 0.8rem; }
.btn-contest-action { border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: white; flex: 1; transition: opacity 0.2s; }
.btn-contest-action:hover { opacity: 0.9; }
.btn-accept { background-color: #28a745; }
.btn-reject { background-color: #dc3545; }
.contest-status-badge { display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: space-between; }
.contest-status-badge span { background-color: #a0a0a0; color: white; padding: 6px 20px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; font-style: italic; flex: 1; text-align: center; }
.contest-status-badge.accepted span { background-color: #a0a0a0; } 
.contest-status-badge.rejected span { background-color: #a0a0a0; }
.btn-dismiss { background: none; border: none; font-size: 1.2rem; color: #999; cursor: pointer; }
.btn-dismiss:hover { color: #666; }

/* --- MODAL (Estilo Genérico) --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
.modal-card h3 { font-family: 'Poppins', sans-serif; font-style: italic; font-weight: 500; margin-bottom: 1.5rem; color: #333; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.modal-select, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: 'Poppins', sans-serif; box-sizing: border-box; }
.textarea-container { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-modal-confirm { background-color: #007bff; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.btn-modal-cancel { background-color: transparent; border: 1px solid #ccc; padding: 10px 24px; border-radius: 4px; cursor: pointer; color: #666; }

@media (max-width: 900px) {
  .specific-layout { flex-direction: column; gap: 3rem; }
  .specific-right { flex: 1; }
  .controls-row-global { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .tab-content { padding: 2rem; }
  .contest-header-row { display: none; } /* Ocultar header em mobile */
  .contest-row { grid-template-columns: 1fr; gap: 1rem; }
}
</style>