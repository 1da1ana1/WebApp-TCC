import { createRouter, createWebHistory } from 'vue-router'


import SearchSupervisor from '../views/SearchProfessorView.vue'


const routes = [
  
  {
    path: '/',
    name: 'Home',
    component: SearchSupervisor, // Define a busca como página inicial
    // Se quiser que a Home use o layout padrão, não precisa por meta
  },

  // --- 2. ROTA DE INFORMAÇÕES (Layout Público) ---
  {
    path: '/info',
    name: 'PublicInfo',
    component: () => import('@/views/PublicInfoView.vue'),
    meta: { layout: 'public' } // <--- ISSO ATIVA O PublicLayout
  },

  // --- 3. ROTA DE BUSCA (A mesma da Home, mas com URL explícita) ---
  {
    path: '/search-supervisor',
    name: 'SearchSupervisor',
    component: SearchSupervisor,
  },

  // --- 4. PERFIL DO ALUNO ---
  {
    path: '/perfil/aluno',
    name: 'StudentProfile',
    component: () => import('@/views/StudentProfileView.vue'),
  },

  // --- 5. PERFIL DO DOCENTE (Com ID dinâmico) ---
  {
    path: '/docente/:id',
    name: 'ProfessorProfile',
    component: () => import('@/views/ProfessorProfileView.vue'),
  },

  // --- 6. PAINEL DO COORDENADOR ---
  {
    path: '/painel/coordenador',
    name: 'CoordinatorDashboard',
    component: () => import('@/views/CoordinatorDashboardView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router