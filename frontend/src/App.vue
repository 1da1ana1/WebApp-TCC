<template>
  <div class="app-layout">
    <HeaderMenu />
    <div class="app-body">
      <main class="main-content">
        <router-view /> 
      </main>
      <SideBar />

    </div>
  </div>
</template>

<script>

import { defineComponent } from 'vue'
import HeaderMenu from './components/HeaderMenu.vue'
import SideBar from './components/SideBar.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeaderMenu,
    SideBar,
 
  },

  data() {
    return {
      mockProfessor: {
        id: 1,
        name: "Teste de Layout do Professor",
        vagas: "3/5"
      }
    }
  }
})
</script>

<style>


.app-body {
  display: flex; 
  padding-top: var(--header-height); 
}


.main-content {
  flex-grow: 1; 

}
</style>