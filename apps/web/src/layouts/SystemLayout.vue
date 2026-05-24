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
  /* Garante que a área principal preencha pelo menos a viewport abaixo
     do header — assim o filtro lateral (que vai ter min-height igual)
     desce até o rodapé visual da tela mesmo com poucos resultados. */
  min-height: 100vh;
}
.main-content {
  flex-grow: 1;
  /* min-width: 0 evita que conteúdo "indivisível" (URLs longas, imagens)
     force o flex item a estourar a viewport e gerar scroll horizontal. */
  min-width: 0;
}
</style>