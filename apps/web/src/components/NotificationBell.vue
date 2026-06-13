<template>
  <li v-if="isLoggedIn" class="notif">
    <button
      type="button"
      class="notif__bell header-nav-item"
      :aria-label="`Notificações${unreadCount ? ` (${unreadCount} não lidas)` : ''}`"
      @click="toggle"
    >
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadCount > 0" class="notif__badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- backdrop transparente para fechar ao clicar fora -->
    <div v-if="open" class="notif__backdrop" @click="open = false"></div>

    <div v-if="open" class="notif__dropdown" role="menu">
      <header class="notif__head">
        <span>Notificações</span>
        <button
          v-if="unreadCount > 0"
          type="button"
          class="notif__markall"
          @click="markAllRead"
        >
          Marcar todas como lidas
        </button>
      </header>

      <div class="notif__list">
        <p v-if="isLoading" class="notif__state">Carregando…</p>
        <p v-else-if="error" class="notif__state notif__state--error">{{ error }}</p>
        <p v-else-if="items.length === 0" class="notif__state">Nenhuma notificação.</p>

        <button
          v-for="n in items"
          :key="n.id"
          type="button"
          class="notif__item"
          :class="{ 'notif__item--unread': !n.read }"
          @click="onItemClick(n)"
        >
          <span v-if="!n.read" class="notif__dot" aria-hidden="true"></span>
          <span class="notif__content">
            <span class="notif__title">{{ n.title }}</span>
            <span class="notif__body">{{ n.body }}</span>
            <span class="notif__time">{{ formatTime(n.createdAt) }}</span>
          </span>
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getNotifications, markNotificationRead } from '@/services/api'

const authStore = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => !!authStore.user)

const items = ref([])
const isLoading = ref(false)
const error = ref('')
const open = ref(false)

const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    const data = await getNotifications()
    items.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err?.response?.data?.message || 'Falha ao carregar notificações.'
    items.value = []
  } finally {
    isLoading.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) load() // recarrega ao abrir — sem polling, pragmático
}

async function onItemClick(n) {
  if (!n.read) {
    try {
      await markNotificationRead(n.id)
      n.read = true
    } catch {
      // silencioso — não impede a navegação
    }
  }
  if (n.link) {
    open.value = false
    router.push(n.link)
  }
}

async function markAllRead() {
  const unread = items.value.filter((n) => !n.read)
  await Promise.allSettled(
    unread.map((n) =>
      markNotificationRead(n.id).then(() => {
        n.read = true
      }),
    ),
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Carrega na montagem (quando logado) para já mostrar o badge.
if (isLoggedIn.value) load()
</script>

<style scoped>
.notif {
  position: relative;
  display: flex;
  align-items: center;
}

.notif__bell {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  color: inherit;
}

.notif__badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: #c62828;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif__backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.notif__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  max-width: 90vw;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  text-transform: none;
}

.notif__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1f2937;
}

.notif__markall {
  background: none;
  border: none;
  color: #065f8b;
  font-size: 0.72rem;
  cursor: pointer;
  font-family: inherit;
}
.notif__markall:hover {
  text-decoration: underline;
}

.notif__list {
  max-height: 360px;
  overflow-y: auto;
}

.notif__state {
  padding: 1.2rem;
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
  margin: 0;
}
.notif__state--error {
  color: #b91c1c;
}

.notif__item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid #f1f1f1;
  padding: 0.7rem 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}
.notif__item:hover {
  background: #f7fafc;
}
.notif__item--unread {
  background: #eef6fb;
}

.notif__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #065f8b;
  margin-top: 5px;
  flex-shrink: 0;
}

.notif__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.notif__title {
  font-weight: 600;
  font-size: 0.82rem;
  color: #1f2937;
}
.notif__body {
  font-size: 0.78rem;
  color: #555;
  line-height: 1.3;
}
.notif__time {
  font-size: 0.68rem;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
