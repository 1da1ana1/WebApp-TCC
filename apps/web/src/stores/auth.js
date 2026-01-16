import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({ 
    user: null,  
    token: null  
  }),

  // Ativa a persistência automática (salva no localStorage)
  persist: true, 

  actions: {
    async login(email, password) {
      console.log("Tentando logar com:", email, password);

      let mockUser = null;

      // 1. Lógica para ALUNO
      if (email === 'aluno@unicamp.br' && password === '123456') {
        mockUser = {
          id: 1,
          name: 'Yasmim Daiana',
          email: email,
          type: 'student', // Usado para controlar o menu de aluno
          avatar: 'https://i.pravatar.cc/150?u=a' // Opcional: avatar fake
        };
      } 
      // 2. Lógica para DOCENTE
      else if (email === 'prof@unicamp.br' && password === '123456') {
        mockUser = {
          id: 2,
          name: 'Prof. Carlos Silva',
          email: email,
          type: 'teacher', // Usado para controlar o menu de professor
          avatar: 'https://i.pravatar.cc/150?u=b'
        };
      }
      // 3. Lógica para COORDENADOR
      else if (email === 'coord@unicamp.br' && password === '123456') {
        mockUser = {
          id: 3,
          name: 'Coord. Maria Oliveira',
          email: email,
          type: 'coordinator', // Usado para controlar o menu de coordenador
          avatar: 'https://i.pravatar.cc/150?u=c'
        };
      }

      // Se encontrou algum usuário válido
      if (mockUser) {
        this.user = mockUser;
        this.token = `token-falso-${mockUser.type}-123`; // Token diferente para cada tipo
        return true; 
      } else {
        return false; 
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      // O plugin remove do localStorage automaticamente aqui!
    }
  },
});