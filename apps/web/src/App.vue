<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue'; 
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 

import PublicLayout from '@/layouts/PublicLayout.vue';
import SystemLayout from '@/layouts/SystemLayout.vue';

const route = useRoute();
const authStore = useAuthStore();

const layout = computed(() => {
  return (route.meta.layout === 'public') ? PublicLayout : SystemLayout;
});
</script>