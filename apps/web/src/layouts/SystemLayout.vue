<template>
  <div class="app-layout">
    <HeaderMenu :isPublic="false" />
    
    <div class="app-body">
      <main class="main-content">
        <slot /> 
      </main>
      <SideBar />
    </div>
  </div>
</template>

<script setup>
import HeaderMenu from '@/components/HeaderMenu.vue';
import SideBar from '@/components/SideBar.vue';
</script>

<style>
/* Se você tinha CSS global no App.vue, mova para o base.css ou deixe aqui se for específico do layout */
.app-body {
  display: flex; 
  padding-top: var(--header-height); 
}
.main-content {
  flex-grow: 1; 
}
</style>