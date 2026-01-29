import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  function notify(message, options = {}) {
    const id = generateId()
    const type = options.type || 'info' // info | success | error | warning
    const timeout = typeof options.timeout === 'number' ? options.timeout : 3000

    const note = { id, message, type }
    notifications.value.push(note)

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }

    return id
  }

  function success(message, timeout = 3000) {
    return notify(message, { type: 'success', timeout })
  }

  function error(message, timeout = 3000) {
    return notify(message, { type: 'error', timeout })
  }

  function info(message, timeout = 3000) {
    return notify(message, { type: 'info', timeout })
  }

  function remove(id) {
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) notifications.value.splice(idx, 1)
  }

  function clearAll() {
    notifications.value = []
  }

  return { notifications, notify, success, error, info, remove, clearAll }
})
