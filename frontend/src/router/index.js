import { createRouter, createWebHistory } from 'vue-router';
import SearchSupervisor from '../components/SearchProfessor.vue';

const routes = [
  {
    path: '/search-supervisor',
    name: 'SearchSupervisor',
    component: SearchSupervisor,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;