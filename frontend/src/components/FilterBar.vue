<template>
  <aside class="filter-sidebar">
    <h3 class="filter-title">Filtrar professor por temas</h3>

    <div class="filter-container">
      <div class="content-container">
        <div class="visual-tags-header">
          <div class="tags-cloud">
            <span class="visual-tag purple">Lorem</span>
            <span class="visual-tag purple-light">Lorem Ipsum</span>
            <span class="visual-tag purple">Lorem</span>
            <span class="visual-tag yellow">Lorem</span>
            <span class="visual-tag yellow-dark">Lorem</span>
            <span class="visual-tag yellow-long">Lorem ipsum dolor sit amet</span>
            <span class="visual-tag yellow-light">Lorem</span>
            <span class="visual-tag yellow-light">Lorem Ipsum</span>
            <span class="visual-tag yellow-light">Lorem</span>
            <span class="visual-tag purple-light">Lorem</span>
            <span class="visual-tag blue">Lorem</span>
            <span class="visual-tag blue-long">Lorem ipsum dolor sit amet</span>
          </div>
          <i class="bi bi-chevron-right header-chevron"></i>
        </div>

        <div class="checkbox-section">
          <div class="checkbox-group">
            <label v-for="theme in themes" :key="theme" class="checkbox-item">
              <input
                type="checkbox"
                :checked="selectedThemes.includes(theme)"
                @change="toggleTheme(theme)"
              />
              <span class="checkmark"></span>
              <span class="label-text">{{ theme }}</span>
            </label>
          </div>

          <button class="btn-clear" @click="$emit('clear')">Limpar seleção</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
// Definindo props claras para o pai preencher
const props = defineProps({
  themes: {
    type: Array,
    // Valor padrão caso não venha do pai, para não quebrar o layout
    default: () => [
      'Lorem Ipsum dolor',
      'Inteligência Artificial',
      'Engenharia de Software',
      'Banco de Dados',
      'Análise de Dados',
      'Lorem ipsum',
      'Lorem ipsum',
      'Lorem',
    ],
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

  // Envia a nova lista para o v-model:selectedThemes do pai
  emit('update:selectedThemes', newSelection)
}
</script>

<style scoped>
/* --- ESTRUTURA GERAL --- */
.filter-sidebar {
  width: 280px; /* Largura aproximada do design */
  font-family: 'Poppins', sans-serif; /* Assumindo a fonte do projeto */
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
  overflow: hidden; /* Garante que o cabeçalho cinza não vase */
  padding: 0 1.75rem 1.75rem 1.75rem;
}

.content-container {
  border: 1px solid var(--color-border-default);
  border-radius: 2px;
}

/* --- SEÇÃO SUPERIOR (CINZA) --- */
.visual-tags-header {
  background-color: #d9d9d9; /* Fundo cinza exato da imagem */
  padding: 1.5rem;
  position: relative;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: flex-start;
  padding-bottom: 1rem; /* Espaço para a seta */
}

/* Estilos Base das Tags Visuais */
.visual-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Cores específicas das Tags (extraídas da imagem) */
.visual-tag.purple {
  background-color: #bd93f9;
  color: #4c1d95;
}
.visual-tag.purple-light {
  background-color: #d8b4fe;
  color: #4c1d95;
}
.visual-tag.yellow {
  background-color: #e2d966;
  color: #6b6212;
}
.visual-tag.yellow-dark {
  background-color: #d4c84a;
  color: #5c540d;
}
.visual-tag.yellow-long {
  background-color: #d4c84a;
  color: #5c540d;
  font-weight: 500;
}
.visual-tag.yellow-light {
  background-color: #fef08a;
  color: #854d0e;
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

.header-chevron {
  position: absolute;
  bottom: 10px;
  right: 15px;
  color: #888;
  font-size: 1.2rem;
}

/* --- SEÇÃO INFERIOR (CHECKBOXES) --- */
.checkbox-section {
  padding: 1.5rem;
  background: #fff;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

/* Estilização do Checkbox Personalizado */
.checkbox-item {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px; /* Espaço para o checkbox personalizado */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  user-select: none;
}

/* Esconde o input nativo do navegador */
.checkbox-item input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Cria o quadrado do checkbox personalizado */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #ccc; /* Borda cinza quando não marcado */
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* Quando o input está marcado, muda o estilo do .checkmark */
.checkbox-item input:checked ~ .checkmark {
  background-color: #4c1d95; /* Cor roxa exata do check */
  border-color: #4c1d95;
}

/* Cria o ícone de "check" (✓) branco */
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Mostra o ícone quando marcado */
.checkbox-item input:checked ~ .checkmark:after {
  display: block;
}

/* Desenha o "check" branco usando CSS */
.checkbox-item .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  margin-left: 5px;
}

/* --- BOTÃO LIMPAR SELEÇÃO --- */
.btn-clear {
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border: 2px solid #7c3aed; /* Borda roxa */
  color: #7c3aed; /* Texto roxo */
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
  background-color: #f3e8ff; /* Fundo roxo claro no hover */
}
</style>
