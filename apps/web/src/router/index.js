import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import SearchSupervisor from '@/views/aluno/SearchProfessorView.vue'
import CoordinatorUserDetailsView from '@/views/coordenador/CoordinatorUserDetailsView.vue';
import ProfessorDashboardView from '@/views/docente/ProfessorDashboardView.vue'


const routes = [

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { layout: 'public' }
  },
  
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/PublicInfoView.vue'),
    meta: { layout: 'public' }
  },

  {
    path: '/info',
    name: 'PublicInfo',
    component: () => import('@/views/PublicInfoView.vue'),
    meta: { layout: 'public' }
  },

  {
    path: '/search-supervisor',
    name: 'SearchSupervisor',
    component: SearchSupervisor,
  },

  {
    path: '/perfil/aluno',
    name: 'StudentProfile',
    component: () => import('@/views/aluno/StudentProfileView.vue'),
  },

  {
    path: '/docente/:id',
    name: 'ProfessorProfile',
    component: () => import('@/views/aluno/ProfessorProfileView.vue'),
  },

  {
    path: '/perfil/docente', 
    name: 'ProfessorDashboard', 
    component: ProfessorDashboardView, 
    meta: { 
      requiresAuth: true, 
      type: 'teacher' 
    }
  },
  {
    path: '/painel/coordenador',
    name: 'CoordinatorDashboard',
    component: () => import('@/views/coordenador/CoordinatorDashboardView.vue'),
  },

  {
    path: '/coordenador/buscar-usuario',
    name: 'CoordinatorSearch',
    component: () => import('@/views/coordenador/CoordinatorSearchView.vue'),
  },
  {
    path: '/coordenador/usuario/:id', // :id é o parâmetro dinâmico
    name: 'CoordinatorUserDetails',
    component: CoordinatorUserDetailsView,
    meta: { layout: 'coordinator' } // Se usar layout system
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard - Verifica autenticação antes de acessar rotas protegidas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/', '/info']
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // Se é rota pública, deixa passar
  if (isPublicRoute) {
    next()
    return
  }
  
  // Se é rota protegida e não está autenticado
  if (!isPublicRoute && !authStore.user) {
    next('/login')
    return
  }
  
  next()
})

export default router