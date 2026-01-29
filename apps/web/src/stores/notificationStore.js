import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  // Adiciona uma notificação (tipo: 'success', 'error', 'info', 'warning')
  const add = (notification) => {
    const id = Date.now() + Math.random()
    
    // Cria o objeto com padrões
    const newItem = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      timeout: notification.timeout || 3000
    }

    notifications.value.push(newItem)

    // Remove automaticamente após o tempo
    if (newItem.timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, newItem.timeout)
    }
  }

  const remove = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  // Atalhos úteis
  const success = (msg, timeout) => add({ type: 'success', message: msg, timeout })
  const error = (msg, timeout) => add({ type: 'error', message: msg, timeout })
  const info = (msg, timeout) => add({ type: 'info', message: msg, timeout })

  return {
    notifications,
    add,
    remove,
    success,
    error,
    info
  }
})
