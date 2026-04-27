import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import SearchSupervisor from '@/views/student/SearchTeacherView.vue'
import CoordinatorUserDetailsView from '@/views/coordinator/CoordinatorUserDetailsView.vue';
import TeacherDashboardView from '@/views/teacher/TeacherDashboardView.vue'


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
    component: () => import('@/views/student/StudentProfileView.vue'),
  },

  {
    path: '/docente/:id',
    name: 'ProfessorProfile',
    component: () => import('@/views/student/TeacherProfileView.vue'),
  },

  {
    path: '/docente/orientandos',
    name: 'StudentSearch',
    component: () => import('@/views/teacher/StudentSearch.vue'),
    meta: {
      requiresAuth: true,
      requiredRole: 'teacher'
    }
  },

  {
    path: '/perfil/docente', 
    name: 'ProfessorDashboard', 
    component: TeacherDashboardView, 
    meta: { 
      requiresAuth: true, 
      requiredRole: 'teacher'
    }
  },
  {
    path: '/perfil-coordenador',
    name: 'CoordinatorDashboard',
    component: () => import('@/views/coordinator/CoordinatorDashboardView.vue'),
    meta: {
      requiresAuth: true,
      requiredRole: 'coordinator'
    }
  },

  {
    path: '/coordenador/buscar-usuario',
    name: 'CoordinatorSearch',
    component: () => import('@/views/coordinator/CoordinatorSearchView.vue'),
    meta: {
      requiresAuth: true,
      requiredRole: 'coordinator'
    }
  },
  {
    path: '/coordenador/usuario/:id',
    name: 'CoordinatorUserDetails',
    component: CoordinatorUserDetailsView,
    meta: {
      requiresAuth: true,
      requiredRole: 'coordinator'
    }
  },

  {
    path: '/acesso-negado',
    name: 'Access Denied',
    component: () => import('@/views/AccessDeniedView.vue'),
    meta: { layout: 'public' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ============================================
// NAVIGATION GUARD - Proteção de Autenticação e Autorização
// ============================================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/', '/info', '/acesso-negado']
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // 1. Se é rota pública, deixa passar
  if (isPublicRoute) {
    next()
    return
  }

  // 2. Se é rota protegida e não está autenticado, redireciona para login
  if (!authStore.user) {
    next('/login')
    return
  }

  // 3. Verifica se a rota requer um role específico
  if (to.meta.requiredRole) {
    const userRole = authStore.user.type
    const requiredRole = to.meta.requiredRole

    // Se o role do usuário não bate com o requerido, acesso negado
    if (userRole !== requiredRole) {
      console.warn(
        `❌ Acesso Negado: Usuário com role '${userRole}' tentou acessar rota que requer '${requiredRole}'`,
        `Rota: ${to.path}`
      )
      next('/acesso-negado')
      return
    }
  }

  // 4. Deixa a navegação acontecer
  next()
})

export default router