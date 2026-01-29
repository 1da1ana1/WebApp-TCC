<template>
  <div class="stat-card" :class="performanceClass">
    <h3>{{ label }}</h3>
    <div class="stat-value" :class="performanceClass">{{ value }}</div>
    <small v-if="subtitle">{{ subtitle }}</small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  // Performance level: 'good' (green), 'alert' (yellow), 'danger' (red)
  performance: {
    type: String,
    default: 'good',
    validator: (v) => ['good', 'alert', 'danger'].includes(v)
  }
})

const performanceClass = computed(() => {
  return `performance-${props.performance}`
})
</script>

<style scoped>
.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #eee;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding: 1rem 0;
  border-radius: 8px;
}

.stat-value.performance-good {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.stat-value.performance-alert {
  background-color: #fff3e0;
  color: #e65100;
  border: 2px solid #ff9800;
}

.stat-value.performance-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 2px solid #f44336;
}

.stat-card small {
  color: #888;
  font-size: 0.8rem;
  display: block;
  margin-top: 0.5rem;
}
</style>
