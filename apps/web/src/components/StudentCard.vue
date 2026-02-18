<template>
  <div class="student-card">
    <div class="avatar-col">
      <div class="avatar-circle">
        <i class="bi bi-person-fill"></i>
      </div>
    </div>

    <div class="info-col">
      <h3 class="student-name">{{ student.name }}</h3>
      <span class="student-ra">{{ student.id }}</span>
    </div>

    <div class="tags-col">
      <span v-for="(tag, index) in student.tags" :key="index" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: {
    type: Object,
    required: true
  }
})
// A função JS de cor foi removida pois agora é controlada pelo CSS
</script>

<style scoped>
/* Definindo as variáveis de cor localmente para que funcionem. 
   Se você já tem essas variáveis no seu arquivo global.css, pode remover este bloco :root */
.student-card {
  --color-tag1: #dcd76e;
  --color-tag1-darker: #5f5a00;
  --color-tag2: #a68bf7;
  --color-tag2-darker: #3d00b8; /* Roxo mais escuro para texto/borda */
  --color-tag3: #87ceeb;       /* Azul exemplo para a 3ª cor */
  --color-tag3-darker: #004a6f;
}

.student-card {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: white;
  gap: 1.5rem;
  min-height: 100px;
}

.avatar-col {
  flex-shrink: 0;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background-color: #1e1e1e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.info-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.student-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.25rem 0;
}

.student-ra {
  font-size: 0.85rem;
  font-weight: 400;
  color: #333;
}

.tags-col {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 40%;
}

/* --- NOVO ESTILO DAS TAGS --- */

.tag {
  width: fit-content;
  height: 32px;
  border-radius: 1rem;
  font-weight: bold;
  font-style: italic;
  font-size: 10px;
  /* display: block; removido pois o display flex abaixo sobrescreve */
  padding: 0 12px; /* Ajustei o padding para 0 nas laterais pois height fixo + flex center já centralizam verticalmente */
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box; /* Garante que o padding não aumente o height */
}

/* Lógica de cores baseada na posição (do último para o primeiro) */
.tag:nth-last-child(1) {
  background-color: var(--color-tag1);
  color: var(--color-tag1-darker);
  border: 1px solid var(--color-tag1-darker);
}

.tag:nth-last-child(2) {
  background-color: var(--color-tag2);
  color: var(--color-tag2-darker);
  border: 1px solid var(--color-tag2-darker);
}

.tag:nth-last-child(3) {
  background-color: var(--color-tag3);
  color: var(--color-tag3-darker);
  border: 1px solid var(--color-tag3-darker);
}

@media (max-width: 768px) {
  .student-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .tags-col {
    justify-content: flex-start;
    max-width: 100%;
  }
}
</style>