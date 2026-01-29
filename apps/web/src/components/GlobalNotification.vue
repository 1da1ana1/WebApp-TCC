<template>
  <div class="gn-wrapper" aria-live="polite">
    <transition-group name="gn-list" tag="div">
      <div v-for="note in notifications" :key="note.id" :class="['gn-item', note.type]">
        <div class="gn-content">
          <div class="gn-message">{{ note.message }}</div>
          <button class="gn-close" @click="dismiss(note.id)">✕</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const store = useNotificationStore()
const notifications = computed(() => store.notifications)

const dismiss = (id) => store.remove(id)
</script>

<style scoped>
.gn-wrapper {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse; /* newest on top */
  gap: 0.6rem;
  pointer-events: none;
}

.gn-list-enter-active, .gn-list-leave-active {
  transition: all 240ms ease;
}
.gn-list-enter-from {
  transform: translateY(10px);
  opacity: 0;
}
.gn-list-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.gn-list-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.gn-list-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.gn-item {
  pointer-events: auto;
  min-width: 260px;
  max-width: 360px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  color: #111;
  font-weight: 600;
}

.gn-item.info { border-left: 6px solid #0ea5e9; }
.gn-item.success { border-left: 6px solid #16a34a; }
.gn-item.error { border-left: 6px solid #dc2626; }
.gn-item.warning { border-left: 6px solid #f59e0b; }

.gn-content { display:flex; align-items:center; width:100%; }
.gn-message { flex:1; padding-right: 8px; }
.gn-close {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #777;
}
</style>
