import { defineStore } from 'pinia';

export const useProfessorStore = defineStore('professor', {
  state: () => ({
    teacher: {
      name: 'Prof. Dr. Lorem Ipsum',
      id: '123456',
      photo: '/src/assets/img/foto-perfil.svg',
    },
    vacancies: { total: 5, filled: 0 },
    tags: ['Machine Learning', 'Vue.js'],
    requestsList: [
      { id: 1, name: 'Lorem Ipsum Dolor Siamet', ra: '123456' },
      { id: 2, name: 'João Silva', ra: '123457' },
      { id: 3, name: 'Maria Souza', ra: '123458' },
      { id: 4, name: 'Pedro Alvares', ra: '123459' },
      { id: 5, name: 'Ana Costa', ra: '123460' },
    ],
    historyData: [
      { id: 99, name: 'Aluno Exemplo', ra: '123123', status: 'Aceita', date: '10/02/2025' }
    ],
    isLoading: true, // Controla exibição dos skeletons
    currentView: 'requests', // Mantém a view selecionada
  }),

  // Ativa persistência automática no localStorage
  persist: true,

  actions: {
    // Simula carregamento de dados do mock
    async loadData() {
      this.isLoading = true;
      
      // Simula delay de rede (1-2 segundos)
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isLoading = false;
          resolve();
        }, Math.random() * 1000 + 1000); // 1-2 segundos
      });
    },

    addTag(newTag) {
      if (newTag.trim() !== '') {
        this.tags.push(newTag.trim());
      }
    },

    removeTag(index) {
      this.tags.splice(index, 1);
    },

    removeRequest(requestId) {
      this.requestsList = this.requestsList.filter(r => r.id !== requestId);
    },

    addToHistory(request, status, justification = null) {
      this.historyData.unshift({
        id: request.id,
        name: request.name,
        ra: request.ra,
        status,
        justification,
        date: new Date().toLocaleDateString('pt-BR')
      });
    },

    setCurrentView(view) {
      this.currentView = view;
    },

    resetStore() {
      this.$reset();
    }
  }
});
