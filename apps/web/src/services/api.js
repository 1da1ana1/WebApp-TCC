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

export default api;