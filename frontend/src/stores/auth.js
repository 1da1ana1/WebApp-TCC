import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({ 
    user: null,  
    token: null  
  }),

  // Ativa a persistência automática para esta store
  persist: true, 

  actions: {
    async login(email, password) {
      console.log("Tentando logar com:", email, password);

      // LÓGICA MOCKADA
      if (email === 'aluno@unicamp.br' && password === '123456') {
        this.user = {
          id: 1,
          name: 'Yasmim Daiana',
          email: 'aluno@unicamp.br',
          type: 'student' // Fique atento: no seu Header você usou 'tipo' ou 'role'
        };
        this.token = 'token-falso-123456';
        
        // O plugin salva no localStorage automaticamente aqui!
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