import { defineStore } from 'pinia';
import api from '@/services/api';

/**
 * Decodifica o payload (segunda parte) de um JWT sem validar a assinatura —
 * usado só para ler claims públicas (id, email, role) no fluxo de SSO.
 * Retorna null se o token for malformado.
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

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

    /**
     * Finaliza uma sessão iniciada via SSO (RF019). O backend redireciona ao
     * front com o JWT já assinado; aqui apenas armazenamos o token e extraímos
     * o usuário do próprio payload (id, email, role). Dados como nome/perfil
     * são carregados sob demanda pelas telas.
     * @param {string} token access_token devolvido pelo callback do SSO
     * @returns {boolean} true se o token pôde ser decodificado
     */
    loginWithToken(token) {
      const payload = decodeJwtPayload(token);
      if (!payload?.sub) return false;

      this.token = token;
      this.user = {
        id: payload.sub,
        name: payload.name || '',
        email: payload.email || '',
        type: (payload.typeUser || '').toLowerCase(),
        teacherId: null,
        studentId: null,
      };
      return true;
    },

    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
