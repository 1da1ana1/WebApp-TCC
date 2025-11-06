<template>
  
  <div class="professor-card">
    <div class="professor-info">
      <img src="/src/assets/img/foto-perfil.svg" alt="foto de perfil" />
      <p>Prof Nome Sobrenome</p>
      <div class="available-spots">5/5 vagas disponíveis</div>
      <div class="registered-tags">
        <span class="tag">Inteligência Artificial</span>
        <span class="tag">Machine Learning</span>
        <span class="tag">Mineração de Dados</span>
      </div>
    </div>
    <div class="send-request">
      <button class="send-request-btn">Enviar Solicitação</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
defineProps({
  teacher: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.professor-card {
  background-color: var(--white-color);
  max-width: 68.313rem;
  width: 100%;
  height: 9.125rem;

  border-bottom: 2px solid var(--color-border-default);

  justify-content: space-between;
  align-items: center;

  position: absolute;

  right: var(--side-bar-width);
  top: var(--header-height);
  padding: 0 2rem 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.professor-info {
 display: grid;
  grid-template-columns: 1fr 1fr; 
  align-items: center;
}

.professor-info > img {
  grid-column: 1;
  grid-row: 1 / span 2;
}

.professor-info > p {
  grid-column: 1;
  grid-row: 1;
  margin: 0 0 0 6rem; 
}

.professor-info > .available-spots {
  grid-column: 1;
  grid-row: 2;
  margin-left: 6rem; 
  align-self: start; 
  
}

.professor-info > .registered-tags {
  grid-row: 1 / span 2;
  display: flex;
  flex-wrap: wrap;         
  gap: 0.5rem;             
  justify-content: flex-start; 
}


.available-spots {
  background-color: var(--color-status-success);
  width: 8rem;
  height: 1.438rem;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--white-color);
  align-content: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  display: flex;
  
}

.registered-tags {
  display: flex;

}

.tag {
  width: fit-content;
  height: 32px;
  border-radius: 1rem;
  font-weight: bold;
  font-style: italic;
  font-size: 10px;
  display: block;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

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

.send-request {
  justify-self: center;
}

.send-request-btn {
  width: 11.813rem;
  height: 2.625rem;
  background-color: var(--color-status-neutral);
  color: var(--color-text-neutral);
  border: 2px solid var(--color-border-default);
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.send-request-btn:hover {
  opacity: 0.8;
}
</style>
