import { defineStore } from 'pinia';
import { getActiveSemester } from '@/services/api';

const STEP_DEFINITIONS = [
  { label: 'Definição de vagas', icon: 'bi-paperclip', startField: 'vacancyDefStartDate', endField: 'vacancyDefEndDate' },
  { label: 'Cadastro de temas', icon: 'bi-list-check', startField: 'themeRegStartDate', endField: 'themeRegEndDate' },
  { label: 'Período de busca', icon: 'bi-chat-left-text', startField: 'searchStartDate', endField: 'searchEndDate' },
  { label: 'Análise solicitações', icon: 'bi-hourglass-split', startField: 'analysisStartDate', endField: 'analysisEndDate' },
  { label: 'Confirmação vínculo', icon: 'bi-person-check', startField: 'linkConfirmStartDate', endField: 'linkConfirmEndDate' },
  { label: 'Encerramento', icon: 'bi-lock', startField: 'closureDate' },
  { label: 'Início orientações', icon: 'bi-pencil-square', startField: 'orientationStartDate' },
  { label: 'Homologação', icon: 'bi-graph-up', startField: 'homologationDate' },
];

const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
};

const formatRange = (start, end) => {
  if (!start && !end) return '';
  if (start && end) return `${formatDay(start)} a ${formatDay(end)}`;
  return formatDay(start || end);
};

const isCurrent = (todayMs, start, end) => {
  if (!start) return false;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return false;
  const endMs = end ? new Date(end).getTime() : startMs;
  // Include the entire end day
  return todayMs >= startMs && todayMs <= endMs + (24 * 60 * 60 * 1000 - 1);
};

const buildSteps = (semester) => {
  const todayMs = Date.now();
  return STEP_DEFINITIONS.map((def) => {
    const start = semester?.[def.startField] || null;
    const end = def.endField ? semester?.[def.endField] || null : null;
    return {
      label: def.label,
      icon: def.icon,
      date: def.endField ? formatRange(start, end) : formatDay(start),
      active: isCurrent(todayMs, start, end),
    };
  });
};

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    semester: null,
    steps: buildSteps(null),
    isLoading: false,
    hasLoaded: false,
  }),

  actions: {
    async loadActiveSemester() {
      this.isLoading = true;
      try {
        const data = await getActiveSemester();
        this.semester = data || null;
        this.steps = buildSteps(this.semester);
      } catch (err) {
        console.error('Erro ao carregar semestre ativo:', err);
        this.steps = buildSteps(null);
      } finally {
        this.isLoading = false;
        this.hasLoaded = true;
      }
    },
  },
});
