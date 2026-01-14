<template>
  <section class="card-section history-area">
    <h3>{{ title }}</h3>
    
    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Data de envio</th>
            <th>Data de resposta</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td class="col-docente">
              <img :src="item.photo || '/src/assets/img/foto-perfil.svg'" class="mini-avatar-table" />
              <div class="docente-info">
                <span class="name">{{ item.name }}</span>
                <span class="ra">{{ item.ra }}</span>
              </div>
            </td>
            <td>{{ item.sendDate }}</td>
            <td>{{ item.replyDate }}</td>
            <td class="col-status">
              <div class="status-wrapper">
                <span>{{ item.status }}</span>
                <i 
                  v-if="item.status.toLowerCase() === 'recusada'" 
                  class="bi bi-search btn-lupa"
                  @click="$emit('view-reason', item.justification)"
                ></i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  data: Array
})

defineEmits(['view-reason'])
</script>

<style scoped>


.history-area {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

h3 {
  margin-top: 0;
  font-weight: 400;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  padding-left: 2rem; 
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.history-table thead th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.history-table tbody tr {
  background-color: #d9d9d9;
  border-bottom: 1px solid #ccc;
  transition: background-color 0.2s;
}

.history-table tbody tr:hover {
  background-color: #cfcfcf;
}


.history-table th:first-child,
.history-table td:first-child {
  padding-left: 2rem; 
}

.history-table th:last-child,
.history-table td:last-child {
  padding-right: 2rem; 
}

.history-table td {
  padding: 1rem;
  font-size: 0.9rem;
}

.col-docente {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-right: 1px solid #999; 
  margin: 0.5rem 0;
}

.mini-avatar-table {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #000;
}

.docente-info {
  display: flex;
  flex-direction: column;
}

.docente-info .name { font-weight: 500; }
.docente-info .ra { font-size: 0.75rem; color: #555; }

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  font-style: italic;
}

.btn-lupa {
  cursor: pointer;
  color: #333;
  font-size: 1.1rem;
}

.btn-lupa:hover { 
  color: var(--color-brand-primary); 
  transform: scale(1.1);
}
</style>