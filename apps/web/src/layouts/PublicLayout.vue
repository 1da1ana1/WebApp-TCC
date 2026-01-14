<template>
  <div class="public-layout">
    <HeaderMenu :isPublic="true" />
    
    <main class="public-content">
      <slot /> </main>
  </div>
</template>

<script setup>
import HeaderMenu from '@/components/HeaderMenu.vue';
</script>

<style scoped>
.public-content {
  padding-top: var(--header-height);
  width: 100%;
}
</style>