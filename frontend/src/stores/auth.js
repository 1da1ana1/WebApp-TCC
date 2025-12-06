import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  
  state: () => ({ 
    user: null,  
    token: null  
  }),

  actions: {
   
    async login(email, password) {
      console.log("Tentando logar com:", email, password);

      // LÓGICA MOCKADA: Aceita um login específico para teste
      // Quando o Back-end estiver pronto, trocar pela chamada da API
      if (email === 'aluno@unicamp.br' && password === '123456') {
        
        this.user = {
          id: 1,
          name: 'Yasmim Daiana',
          email: 'aluno@unicamp.br',
          type: 'student' 
        };
        this.token = 'token-falso-123456';

        localStorage.setItem('user', JSON.stringify(this.user));
        
        return true; 
      } else {
        return false; 
      }
    },

  
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user'); 
    },
    

    checkSession() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        this.token = 'token-recuperado';
      }
    }
  },
});