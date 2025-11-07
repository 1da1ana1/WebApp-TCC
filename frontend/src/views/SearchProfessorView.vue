<template>
  <div class="busca-container">
    <div class="search-results">
      <ProfessorCard 
        v-for="docente in docentes" 
        :key="docente.id" 
        :professor="docente" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProfessorCard from '@/components/ProfessorCard.vue';
// (Aqui você faria a chamada API para buscar os docentes)
const docentes = ref([
  { id: 1, name: "Prof. Mock 1", vagas: "5/5" },
  { id: 2, name: "Prof. Mock 2", vagas: "3/5" },
  { id: 3, name: "Prof. Mock 3", vagas: "0/5" },
]);
</script>

<style scoped>
.busca-container {
  display: flex;
  
}
.search-results {
  width: 100%;
  display: flex;
  flex-direction: column; 
  align-items: center; 
}
</style>