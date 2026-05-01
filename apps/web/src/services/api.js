import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export async function getTeachers() {
  try {
    const response = await api.get('/teachers');
    return response.data;
  } catch (error) {
    console.error('Error at searching teachers:', error);
    throw error;
  }
}

export async function atualizarVagas(teacherId, quantity) {
  const response = await api.post('/vacancies/define', { teacherId, quantity });
  return response.data;
}

export default api;