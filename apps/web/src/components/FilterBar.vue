<template>
  <aside class="filter-sidebar">
    <h3 class="filter-title">{{ title }}</h3>

    <div class="filter-container">
      <div class="content-container">

        <!-- Cabeçalho com contador de selecionados -->
        <div class="tags-header">
          <span class="tags-label">Áreas de Interesse</span>
          <span v-if="selectedTags.length > 0" class="tags-count">
            {{ selectedTags.length }} selecionada{{ selectedTags.length > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Nuvem de chips com scroll automático -->
        <div class="visual-tags-header">
          <div class="tags-cloud" v-if="allTags.length">
            <button
              v-for="tag in allTags"
              :key="tag"
              type="button"
              class="visual-tag"
              :class="selectedTags.includes(tag) ? 'is-selected' : 'is-default'"
              :aria-pressed="selectedTags.includes(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <p v-else class="empty-message">Nenhuma área cadastrada.</p>
        </div>

        <div class="actions-section">
          <button class="btn-clear" @click="handleClear" :disabled="selectedTags.length === 0">
            <i class="bi bi-x-circle"></i> Limpar seleção
          </button>
        </div>

      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Filtrar por temas',
  },
})

const emit = defineEmits(['filter-changed', 'clear'])

// ── Mock de dados: 10 áreas de interesse ─────────────────────────
const MOCK_TAGS = [
  'Inteligência Artificial',
  'Engenharia de Software',
  'Redes de Computadores',
  'Segurança da Informação',
  'Banco de Dados',
  'Sistemas Embarcados',
  'Computação em Nuvem',
  'Visão Computacional',
  'Desenvolvimento Web',
  'Internet das Coisas (IoT)',
]

const allTags = ref(MOCK_TAGS)

// ── Estado interno das tags selecionadas ──────────────────────────
const selectedTags = ref([])

// ── Alterna seleção de uma tag ────────────────────────────────────
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emit('filter-changed', [...selectedTags.value])
}

// ── Limpar todas as seleções ──────────────────────────────────────
const handleClear = () => {
  selectedTags.value = []
  emit('filter-changed', [])
  emit('clear')
}
</script>

<style scoped>
.filter-sidebar {
  width: 280px;
  font-family: 'Poppins', sans-serif;
  background-color: #fff;
}

.filter-title {
  font-style: italic;
  font-weight: 500;
  text-align: left;
  margin: 3rem 0 1rem 1.75rem;
  font-size: 0.9rem;
  color: #000;
}

.filter-container {
  background: #fff;
  overflow: hidden;
  padding: 0 1.75rem 1.75rem 1.75rem;
}

.content-container {
  border: 1px solid var(--color-border-default, #ccc);
  border-radius: 2px;
}

/* ── Cabeçalho interno ──────────────────────────────────────────── */
.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem 0.5rem;
  background: #fff;
}

.tags-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4c1d95;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tags-count {
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
  background: #4c1d95;
  border-radius: 20px;
  padding: 1px 8px;
}

/* ── Área de chips com scroll ──────────────────────────────────── */
.visual-tags-header {
  background-color: #d9d9d9;
  padding: 0 0.75rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: flex-start;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;

  /* Scrollbar discreta */
  scrollbar-width: thin;
  scrollbar-color: #a78bfa #e9d5ff;
}

.tags-cloud::-webkit-scrollbar {
  width: 5px;
}
.tags-cloud::-webkit-scrollbar-track {
  background: #e9d5ff;
  border-radius: 4px;
}
.tags-cloud::-webkit-scrollbar-thumb {
  background: #a78bfa;
  border-radius: 4px;
}

/* ── Chips (pílulas) ─────────────────────────────────────────── */
.visual-tag {
  border: 1px solid transparent;
  padding: 5px 13px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.visual-tag.is-default {
  background-color: #d8b4fe;
  color: #4c1d95;
  border-color: #c084fc;
}

.visual-tag.is-selected {
  background-color: #4c1d95;
  color: #ffffff;
  border-color: #4c1d95;
}

.visual-tag:hover {
  filter: brightness(0.94);
}

.visual-tag:active {
  transform: scale(0.97);
}

.visual-tag:focus-visible {
  outline: 2px solid #4c1d95;
  outline-offset: 2px;
}

/* ── Mensagem vazia ──────────────────────────────────────────── */
.empty-message {
  margin: 0;
  color: #555;
  font-size: 0.875rem;
}

/* ── Botão limpar ────────────────────────────────────────────── */
.actions-section {
  padding: 1rem 1.5rem 1.5rem;
  background: #fff;
}

.btn-clear {
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border: 2px solid #7c3aed;
  color: #7c3aed;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
}

.btn-clear:hover:not(:disabled) {
  background-color: #f3e8ff;
}

.btn-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #c4b5fd;
  color: #c4b5fd;
}

@media (max-width: 1024px) {
  .filter-sidebar {
    width: 100%;
  }
}
</style>
