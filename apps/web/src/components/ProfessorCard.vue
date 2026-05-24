<template>
  <div class="professor-card">
    <div class="professor-info">
      <img src="/src/assets/img/foto-perfil.svg" alt="foto de perfil" class="profile-img" />

      <div class="details-column">
        <p class="professor-name">{{ professor.name }}</p>
        <div class="available-spots">
          {{ professor.vagas != null ? `${professor.vagas} vagas disponíveis` : 'Vagas não informadas' }}
        </div>
      </div>

      <div class="tags-column">
        <div class="registered-tags">
          <span class="tag">Inteligência Artificial</span>
          <span class="tag">Machine Learning</span>
          <span class="tag">Mineração de Dados</span>
        </div>
      </div>
    </div>
    
    <div class="action-column">
      <router-link
        :to="{ name: 'ProfessorProfile', params: { id: professor.id } }"
        class="send-request-btn"
      >
        Ver Perfil
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
  professor: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
/* Container Principal */
.professor-card {
  background-color: var(--white-color);
  width: 100%;
  /* Usa min-height em vez de height fixo para não quebrar no zoom */
  min-height: 7rem;
  border-bottom: 2px solid var(--color-border-default);
  padding: 1.5rem 2rem;
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  box-sizing: border-box;
}

/* Container de Informações (Foto + Nome/Vagas + Tags) */
.professor-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1; /* Ocupa todo o espaço disponível à esquerda do botão */
}

.profile-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

/* Coluna de Nome e Vagas */
.details-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px; /* Evita que o nome fique muito espremido */
}

.professor-name {
  margin: 0;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.available-spots {
  background-color: var(--color-status-success);
  width: fit-content;
  padding: 0.3rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--white-color);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

/* Coluna de Tags */
.tags-column {
  flex: 1;
  display: flex;
  align-items: center;
}

.registered-tags {
  display: flex;
  flex-wrap: wrap; /* Permite que as tags quebrem de linha se não houver espaço */
  gap: 0.5rem;
}

.tag {
  height: 28px;
  border-radius: 1rem;
  font-weight: bold;
  font-style: italic;
  font-size: 0.65rem;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* Cores das tags (mantidas do seu original) */
.tag:nth-child(3n+1) {
  background-color: var(--color-tag1, #e3f2fd);
  color: var(--color-tag1-darker, #1565c0);
  border: 1px solid var(--color-tag1-darker, #1565c0);
}

.tag:nth-child(3n+2) {
  background-color: var(--color-tag2, #f3e5f5);
  color: var(--color-tag2-darker, #6a1b9a);
  border: 1px solid var(--color-tag2-darker, #6a1b9a);
}

.tag:nth-child(3n) {
  background-color: var(--color-tag3, #e8f5e9);
  color: var(--color-tag3-darker, #2e7d32);
  border: 1px solid var(--color-tag3-darker, #2e7d32);
}

/* Coluna do Botão de Ação */
.action-column {
  flex-shrink: 0; /* Impede que o botão encolha */
}

.send-request-btn {
  display: flex;
  width: 10rem;
  height: 2.625rem;
  background-color: var(--color-status-neutral, #f5f5f5);
  color: var(--color-text-neutral, #333);
  border: 2px solid var(--color-border-default, #ccc);
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}

.send-request-btn:hover {
  opacity: 0.8;
  background-color: #e0e0e0; /* Um leve feedback visual além da opacidade */
}

/* ==========================================================================
   RESPONSIVIDADE
   ========================================================================== */
@media (max-width: 900px) {
  .professor-info {
    flex-wrap: wrap; /* Permite que as tags caiam para a linha de baixo */
    gap: 1rem;
  }
  .tags-column {
    min-width: 100%; /* Força as tags a ocuparem a largura total abaixo do nome */
  }
}

@media (max-width: 600px) {
  .professor-card {
    flex-direction: column; /* Empilha tudo: Foto/Nome -> Tags -> Botão */
    align-items: flex-start;
    padding: 1.5rem;
  }

  .professor-info {
    width: 100%;
  }

  .action-column {
    width: 100%;
    margin-top: 1rem;
  }

  .send-request-btn {
    width: 100%; /* Botão ocupa toda a largura no celular */
  }
}
</style>