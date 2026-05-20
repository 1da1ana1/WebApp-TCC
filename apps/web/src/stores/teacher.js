import { defineStore } from 'pinia';
import {
  getMyRequests,
  getTeacherStats,
  getMyOrientations,
  getTeacherVacancies,
  defineVacancies as apiDefineVacancies,
} from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const ORIENTATION_STATUS_LABELS = {
  ACTIVE: 'Em vigência',
  COMPLETED: 'Finalizada',
  CANCELED: 'Cancelada',
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '';

const normalizeRequest = (request) => ({
  id: request.id,
  name: request?.student?.user?.name || 'Aluno desconhecido',
  ra: request?.student?.ra || '',
  status: request.status,
  sendDate: formatDate(request.sendDate),
  responseDate: formatDate(request.responseDate),
  justification: request.denialJustification || null,
});

const normalizeOrientation = (orientation) => {
  const firstStudent = orientation?.students?.[0];
  return {
    id: orientation.id,
    name: firstStudent?.user?.name || 'Aluno desconhecido',
    ra: firstStudent?.ra || '',
    sendDate: formatDate(orientation.startDate),
    replyDate: formatDate(orientation.endDate),
    status: ORIENTATION_STATUS_LABELS[orientation.status] || orientation.status || '',
    justification: null,
  };
};

const sumVacancyQuantity = (vacancies) =>
  Array.isArray(vacancies)
    ? vacancies.reduce((acc, v) => acc + (Number(v?.quantity) || 0), 0)
    : 0;

const normalizeTeacherStats = (stats, vagasTotais = 0) => {
  const recebidas = stats?.totalRequests ?? 0;
  const aceitas = stats?.acceptedRequests ?? 0;
  const taxaAceiteRaw = stats?.acceptanceRate ?? 0;
  const taxaAceite =
    typeof taxaAceiteRaw === 'string'
      ? parseInt(taxaAceiteRaw, 10) || 0
      : Number(taxaAceiteRaw) || 0;

  return {
    recebidas,
    aceitas,
    recusadas: Math.max(recebidas - aceitas, 0),
    taxaAceite,
    concluidas: stats?.completedOrientations ?? 0,
    vagasOcupadas: stats?.activeOrientations ?? 0,
    vagasTotais,
  };
};

export const useTeacherStore = defineStore('teacher', {
  state: () => ({
    teacher: {
      name: 'Prof. Dr. Lorem Ipsum',
      id: '123456',
      photo: '/src/assets/img/foto-perfil.svg',
    },
    vacancies: { total: 5, filled: 0 },
    tags: ['Machine Learning', 'Vue.js'],
    requestsList: [],
    historyData: [],
    guidancesList: [
      { id: 101, studentName: 'Maria Clara', project: 'IA na Medicina', startDate: '15/02/2025', semester: '2025-1', status: 'Em vigência' },
      { id: 102, studentName: 'Roberto Carlos', project: 'Sistemas Distribuídos', startDate: '10/08/2024', semester: '2024-2', status: 'Finalizada', endDate: '10/12/2024' },
    ],
    statsData: {
      recebidas: 0,
      aceitas: 0,
      recusadas: 0,
      taxaAceite: 0,
      concluidas: 0,
      vagasOcupadas: 0,
      vagasTotais: 0,
    },
    semestreSelecionado: '2025-1',
    mostrarFiltroSemestre: false,
    isLoading: false,
    currentView: 'requests',
  }),

  persist: true,

  actions: {
    async loadData() {
      this.isLoading = true;
      try {
        const authStore = useAuthStore();
        const teacherId = authStore.user?.teacherId ?? null;

        const [requestsRaw, statsRaw, orientationsRaw, vacanciesRaw] = await Promise.all([
          getMyRequests(),
          getTeacherStats(),
          getMyOrientations(),
          teacherId ? getTeacherVacancies(teacherId) : Promise.resolve([]),
        ]);

        const allRequests = Array.isArray(requestsRaw) ? requestsRaw.map(normalizeRequest) : [];
        this.requestsList = allRequests.filter((r) => r.status === 'PENDING');

        this.historyData = Array.isArray(orientationsRaw)
          ? orientationsRaw.map(normalizeOrientation)
          : [];

        const totalVacancies = sumVacancyQuantity(vacanciesRaw);
        const filledVacancies = Array.isArray(orientationsRaw)
          ? orientationsRaw.filter((o) => o?.status === 'ACTIVE').length
          : 0;
        this.vacancies = { total: totalVacancies, filled: filledVacancies };

        this.statsData = normalizeTeacherStats(statsRaw, totalVacancies);
      } catch (err) {
        console.error('Erro ao carregar dados do docente:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async defineVacancies(quantity) {
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error('Quantidade de vagas inválida.');
      }
      await apiDefineVacancies(qty);
      await this.loadData();
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
        sendDate: request.sendDate || '',
        replyDate: new Date().toLocaleDateString('pt-BR'),
      });
    },

    updateGuidanceStatus(guideId, status, endDate = null) {
      const guidance = this.guidancesList.find(g => g.id === guideId);
      if (guidance) {
        guidance.status = status;
        if (endDate) {
          guidance.endDate = endDate;
        }
      }
    },

    addGuidance(guidance) {
      this.guidancesList.unshift(guidance);
    },

    setSemestre(semestre) {
      this.semestreSelecionado = semestre;
    },

    toggleFiltroSemestre() {
      this.mostrarFiltroSemestre = !this.mostrarFiltroSemestre;
    },

    setCurrentView(view) {
      this.currentView = view;
    },

    resetStore() {
      this.$reset();
    }
  }
});
