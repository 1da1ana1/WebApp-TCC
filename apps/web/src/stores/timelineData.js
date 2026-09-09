import { defineStore } from 'pinia';
import { getActiveSemester } from '@/services/api';
import { buildSteps } from '@/utils/timelineSteps';

// Tempo que os dados em memória continuam valendo. Serve para uma aba deixada
// aberta não ficar presa a um cronograma antigo: ao navegar para outra página,
// o store revalida em vez de reaproveitar indefinidamente o primeiro fetch.
const STALE_AFTER_MS = 60 * 1000;

// Requisição em andamento, compartilhada por todos os chamadores. Fica fora do
// state porque promise não é estado serializável (o app usa
// pinia-plugin-persistedstate).
//
// Existe para resolver a corrida entre componentes que montam juntos: na tela
// da coordenação, o cronograma e o formulário de calendário chamam o store no
// mesmo tick. Sem isto, o segundo chamador precisaria escolher entre disparar
// um fetch duplicado ou desistir — e desistir devolveria o controle antes de
// `semester` estar preenchido, deixando o formulário em branco. Devolvendo a
// promise em voo, quem chega depois espera o mesmo resultado.
let inFlight = null;

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    semester: null,
    steps: buildSteps(null),
    isLoading: false,
    hasLoaded: false,
    lastLoadedAt: 0,
  }),

  getters: {
    isStale: (state) => !state.hasLoaded || Date.now() - state.lastLoadedAt > STALE_AFTER_MS,
  },

  actions: {
    // Busca o semestre ativo. Use depois de gravar o cronograma, para as telas
    // refletirem o que acabou de ser salvo.
    //
    // Sempre resolve DEPOIS de `semester` estar atualizado — quem dá await pode
    // ler o resultado em seguida com segurança.
    async loadActiveSemester() {
      if (inFlight) return inFlight;

      this.isLoading = true;
      inFlight = (async () => {
        try {
          const data = await getActiveSemester();
          this.semester = data || null;
          this.steps = buildSteps(this.semester);
          this.lastLoadedAt = Date.now();
        } catch (err) {
          console.error('Erro ao carregar semestre ativo:', err);
          // Mantém as etapas anteriores se já havia dados: um erro de rede não
          // deve apagar da tela um cronograma que estava correto.
          if (!this.hasLoaded) this.steps = buildSteps(null);
        } finally {
          this.isLoading = false;
          this.hasLoaded = true;
          inFlight = null;
        }
      })();

      return inFlight;
    },

    // Ponto de entrada dos componentes de cronograma: só vai à rede quando os
    // dados nunca foram carregados ou já venceram.
    async ensureLoaded() {
      if (this.isStale) await this.loadActiveSemester();
    },
  },
});
