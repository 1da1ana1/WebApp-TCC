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
  },

  // ============================================
  // DEV LOGIN — mock de papéis para desenvolvimento e homologação.
  // Só existe no bundle quando a build é dev (vite dev / preview)
  // OU quando VITE_ENABLE_DEV_LOGIN=true. Em produção (flag false ou
  // ausente) a rota literalmente não é registrada.
  // ============================================
  ...(import.meta.env.DEV ||
  import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'
    ? [
        {
          path: '/dev-login',
          name: 'DevLogin',
          component: () => import('@/views/DevLoginView.vue'),
          meta: { layout: 'public' },
        },
      ]
    : []),
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

  // 1. Rotas públicas (marcadas com meta.layout === 'public') passam direto
  if (to.meta.layout === 'public') {
    next()
    return
  }

  // 2. Demais rotas exigem autenticação
  if (!authStore.user) {
    next('/login')
    return
  }

  // 3. Se a rota exige um role específico, valida (case-insensitive)
  if (to.meta.requiredRole) {
    const userRole = (authStore.user.type || '').toLowerCase()
    const requiredRole = String(to.meta.requiredRole).toLowerCase()

    if (userRole !== requiredRole) {
      console.warn(
        `❌ Acesso Negado: Usuário com role '${userRole}' tentou acessar rota que requer '${requiredRole}'`,
        `Rota: ${to.path}`
      )
      next('/acesso-negado')
      return
    }
  }

  next()
})

export default router