<template>
  <aside class="filter-sidebar">
    <h3 class="filter-title">{{ title }}</h3>

    <div class="filter-container">
      <div class="content-container">
        <div class="visual-tags-header">
          <div class="tags-cloud" v-if="themes.length">
            <button
              v-for="theme in themes"
              :key="theme"
              type="button"
              class="visual-tag"
              :class="tagStateClass(theme)"
              :aria-pressed="selectedThemes.includes(theme)"
              @click="toggleTheme(theme)"
            >
              {{ theme }}
            </button>
          </div>

          <p v-else class="empty-message">Nenhuma tag cadastrada.</p>
        </div>

        <div class="actions-section">
          <button class="btn-clear" @click="handleClear">Limpar seleção</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Filtrar por temas',
  },
  themes: {
    type: Array,
    default: () => [],
  },
  selectedThemes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selectedThemes', 'clear'])

const toggleTheme = (theme) => {
  const newSelection = [...props.selectedThemes]
  const index = newSelection.indexOf(theme)

  if (index > -1) newSelection.splice(index, 1)
  else newSelection.push(theme)

  emit('update:selectedThemes', newSelection)
}

const tagStateClass = (theme) => {
  const isSelected = props.selectedThemes.includes(theme)
  return isSelected ? 'is-selected' : 'is-default'
}

const handleClear = () => {
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
  /* Top reduzido (era 3rem) para o filtro encostar logo abaixo do header.
     1.25rem preserva respiro interno entre o topo do <aside> e o título
     sem reproduzir o gap antigo. */
  margin: 1.25rem 0 1rem 1.75rem;
  font-size: 0.9rem;
  color: #000;
}

.filter-container {
  background: #fff;
  overflow: hidden;
  padding: 0 1.75rem 1.75rem 1.75rem;
}

.content-container {
  border: 1px solid var(--color-border-default);
  border-radius: 2px;
}

.visual-tags-header {
  background-color: #d9d9d9;
  padding: 1.5rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: flex-start;
}

.visual-tag {
  border: 1px solid transparent;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  filter: brightness(0.96);
}

.visual-tag:active {
  transform: scale(0.98);
}

.visual-tag:focus-visible {
  outline: 2px solid #4c1d95;
  outline-offset: 2px;
}

.empty-message {
  margin: 0;
  color: #555;
  font-size: 0.875rem;
}

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
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-clear:hover {
  background-color: #f3e8ff;
}

@media (max-width: 1024px) {
  .filter-sidebar {
    width: 100%;
  }
}

.header-chevron {
  display: none;
}

.visual-tag.blue {
  background-color: #63a4ff;
  color: #1e3a8a;
}
.visual-tag.blue-long {
  background-color: #5e92e2;
  color: #1e3a8a;
  font-weight: 500;
}

</style>
