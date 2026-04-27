<template>
  <div class="view-vacancies">
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
                      <button class="btn-clear-all" v-if="selectedProfessors.length > 0" @click="clearAll">Limpar tudo</button>
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
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  selectedProfessors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedProfessors'])

const globalCount = ref(5)
const applyAll = ref(true)
const specificCount = ref(3)
const searchQuery = ref('')

const removeProf = (id) => {
  emit('update:selectedProfessors', props.selectedProfessors.filter(p => p.id !== id))
}

const clearAll = () => {
  emit('update:selectedProfessors', [])
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
  if (props.selectedProfessors.length === 0) return
  Swal.fire({
    icon: 'success',
    title: 'Atualização Específica',
    text: `Vagas atualizadas para ${props.selectedProfessors.length} docentes.`,
    confirmButtonColor: '#065f8b',
    timer: 2000
  })
}
</script>

<style scoped>
@import './panelStyles.css';

.controls-row-global { display: flex; align-items: center; gap: 3rem; background-color: #f8f9fa; padding: 1.5rem 2rem; border-radius: 10px; border: 1px solid #eef0f2; }
.control-group label { display: block; font-weight: 500; color: #555; margin-bottom: 0.8rem; font-size: 0.95rem; }
.specific-layout { display: flex; gap: 4rem; }
.specific-left { flex: 1; }
.specific-right { flex: 1.2; display: flex; flex-direction: column; }
.selected-professors-list { display: flex; flex-direction: column; gap: 0.8rem; max-height: 350px; overflow-y: auto; padding-right: 5px; }
</style>
