<template>
  <div class="search-supervisor">
    <h1>Search supervisors</h1>

    <div v-if="loading">Loading teachers...</div>
    <div v-else-if="error">Error at loading teachers.</div>
    <ul v-else>
      <li v-for="teacher in teachers" :key="teacher.id">
        <strong>{{ teacher.name }}</strong> - {{ teacher.email }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTeachers } from '../services/api.js';

const teachers = ref([]);
const loading = ref(true);
const error = ref(false);

onMounted(async () => {
  try {
    const data = await getTeachers();
    teachers.value = data;
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.search-supervisor {
  padding: 1.5rem;
  max-width: 600px;
  margin: auto;
}
</style>
