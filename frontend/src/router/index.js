import { createRouter, createWebHistory } from 'vue-router'
import SearchSupervisor from '../views/SearchProfessorView.vue'
import ProfessorProfile from '@/views/ProfessorProfileView.vue'

const routes = [
  {
    path: '/search-supervisor',
    name: 'SearchSupervisor',
    component: SearchSupervisor,
  },
  {
    path: '/perfil/aluno',
    name: 'StudentProfile',
    component: () => import('@/views/StudentProfileView.vue'),
  },
  {
    path: '/docente/:id',
    name: 'ProfessorProfile',
    component: () => import('@/views/ProfessorProfileView.vue'),
  },
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
