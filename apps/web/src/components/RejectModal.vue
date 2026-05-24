<template>
  <Transition name="reject-modal">
    <div
      v-if="show"
      class="reject-modal-backdrop"
      role="presentation"
      @click.self="emitClose"
    >
      <div
        class="reject-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        <header class="reject-modal__header">
          <h2 id="reject-modal-title" class="reject-modal__title">
            Recusar solicitação
          </h2>
          <button
            type="button"
            class="reject-modal__close"
            aria-label="Fechar"
            @click="emitClose"
          >
            ×
          </button>
        </header>

        <section class="reject-modal__body">
          <p class="reject-modal__hint">Selecione o motivo da recusa:</p>

          <ul class="reject-modal__options">
            <li v-for="option in REASONS" :key="option">
              <label class="reject-modal__option">
                <input
                  type="radio"
                  name="reject-reason"
                  :value="option"
                  v-model="selectedReason"
                />
                <span>{{ option }}</span>
              </label>
            </li>
          </ul>

          <div v-if="selectedReason === OTHER" class="reject-modal__custom">
            <label for="reject-modal-custom" class="reject-modal__custom-label">
              Descreva o motivo (entre {{ MIN_LEN }} e {{ MAX_LEN }} caracteres):
            </label>
            <textarea
              id="reject-modal-custom"
              v-model="customText"
              :maxlength="MAX_LEN"
              rows="4"
              placeholder="Ex.: Já tenho 4 orientandos confirmados para este semestre e o tema do projeto se distancia das minhas áreas de pesquisa atuais."
              class="reject-modal__textarea"
            ></textarea>
            <div
              class="reject-modal__counter"
              :class="{
                'reject-modal__counter--ok': isCustomValid,
                'reject-modal__counter--warn':
                  customText.length > 0 && !isCustomValid,
              }"
            >
              {{ customText.length }} / {{ MAX_LEN }}
              <span v-if="customText.length < MIN_LEN">
                — mín. {{ MIN_LEN }} ({{ MIN_LEN - customText.length }}
                {{
                  MIN_LEN - customText.length === 1
                    ? 'caractere restante'
                    : 'caracteres restantes'
                }})
              </span>
            </div>
          </div>
        </section>

        <footer class="reject-modal__footer">
          <button
            type="button"
            class="reject-modal__btn reject-modal__btn--ghost"
            @click="emitClose"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="reject-modal__btn reject-modal__btn--danger"
            :disabled="!canConfirm"
            @click="onConfirm"
          >
            Confirmar recusa
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm'])

const REASONS = [
  'Excedeu limite de vagas',
  'Assunto fora da expertise',
  'Estarei afastado',
  'Férias',
  'Outro motivo',
]
const OTHER = 'Outro motivo'
const MIN_LEN = 70
const MAX_LEN = 150

const selectedReason = ref('')
const customText = ref('')

// Reset a cada (re)abertura — parent que controla show=true significa
// "nova rejeição". Mantém o textarea limpo entre uses.
watch(
  () => props.show,
  (open) => {
    if (open) {
      selectedReason.value = ''
      customText.value = ''
    }
  },
)

const isCustomValid = computed(() => {
  const len = customText.value.length
  return len >= MIN_LEN && len <= MAX_LEN
})

const canConfirm = computed(() => {
  if (!selectedReason.value) return false
  return selectedReason.value === OTHER ? isCustomValid.value : true
})

const emitClose = () => emit('close')

const onConfirm = () => {
  if (!canConfirm.value) return
  const justification =
    selectedReason.value === OTHER
      ? customText.value.trim()
      : selectedReason.value
  emit('confirm', justification)
}
</script>

<style scoped>
.reject-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.reject-modal {
  background: #fff;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  font-family: 'Poppins', system-ui, sans-serif;
}

.reject-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #eee;
}

.reject-modal__title {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.reject-modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.reject-modal__close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.reject-modal__body {
  padding: 1.25rem;
  overflow-y: auto;
}

.reject-modal__hint {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.reject-modal__options {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.reject-modal__option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  font-size: 0.92rem;
  color: #1f2937;
}

.reject-modal__option:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.reject-modal__option input[type='radio'] {
  accent-color: #b91c1c;
  margin: 0;
}

.reject-modal__custom {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.25rem;
}

.reject-modal__custom-label {
  font-size: 0.85rem;
  color: #4b5563;
}

.reject-modal__textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-family: inherit;
  font-size: 0.92rem;
  color: #1f2937;
  resize: vertical;
  min-height: 100px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.reject-modal__textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.reject-modal__counter {
  font-size: 0.78rem;
  color: #9ca3af;
  align-self: flex-end;
}

.reject-modal__counter--warn {
  color: #b91c1c;
}

.reject-modal__counter--ok {
  color: #047857;
}

.reject-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid #eee;
}

.reject-modal__btn {
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.reject-modal__btn--ghost {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.reject-modal__btn--ghost:hover {
  background: #f3f4f6;
}

.reject-modal__btn--danger {
  background: #b91c1c;
  color: #fff;
}

.reject-modal__btn--danger:hover:not(:disabled) {
  background: #991b1b;
}

.reject-modal__btn--danger:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.reject-modal-enter-active,
.reject-modal-leave-active {
  transition: opacity 0.18s ease;
}

.reject-modal-enter-active .reject-modal,
.reject-modal-leave-active .reject-modal {
  transition: transform 0.18s ease;
}

.reject-modal-enter-from,
.reject-modal-leave-to {
  opacity: 0;
}

.reject-modal-enter-from .reject-modal,
.reject-modal-leave-to .reject-modal {
  transform: scale(0.96);
}
</style>