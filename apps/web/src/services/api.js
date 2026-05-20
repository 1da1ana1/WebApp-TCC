import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  },
);

export async function getTeachers() {
  try {
    const response = await api.get('/teachers');
    return response.data;
  } catch (error) {
    console.error('Error at searching teachers:', error);
    throw error;
  }
}

export async function getMyRequests() {
  const response = await api.get('/requests');
  return response.data;
}

export async function getTeacherStats() {
  const response = await api.get('/reports/teacher-stats');
  return response.data;
}

export async function getMyOrientations() {
  const response = await api.get('/orientations/my-orientations');
  return response.data;
}

export async function getActiveSemester() {
  const response = await api.get('/semesters/active');
  return response.data;
}

export async function defineVacancies(quantity) {
  const response = await api.post('/vacancies/define', { quantity });
  return response.data;
}

export async function getTeacherVacancies(teacherId) {
  const response = await api.get(`/vacancies/teacher/${teacherId}`);
  return response.data;
}

export default api;
