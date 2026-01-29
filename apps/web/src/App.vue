<template>
  <component :is="layout">
    <router-view />
  </component>

  <!-- Global notifications (snackbars) -->
  <GlobalNotification />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import PublicLayout from '@/layouts/PublicLayout.vue'
import SystemLayout from '@/layouts/SystemLayout.vue'
import GlobalNotification from '@/components/GlobalNotification.vue'

const route = useRoute()
const authStore = useAuthStore()

const layout = computed(() => (route.meta.layout === 'public') ? PublicLayout : SystemLayout)
</script>