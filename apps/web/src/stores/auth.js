import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  persist: true,

  actions: {
    async login(email, password) {
      try {
        const { data } = await api.post('/auth/login', { email, password });

        this.token = data.access_token;
        this.user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          type: (data.user.typeUser || '').toLowerCase(),
          teacherId: data.user.teacherId ?? null,
          studentId: data.user.studentId ?? null,
        };

        return true;
      } catch (err) {
        this.user = null;
        this.token = null;
        if (err.response?.status === 401) {
          return false;
        }
        throw err;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
