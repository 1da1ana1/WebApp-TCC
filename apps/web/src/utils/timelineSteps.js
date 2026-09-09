/**
 * Lógica pura da linha do tempo do TCC: definição das etapas, formatação das
 * datas e cálculo da etapa atual.
 *
 * Vive fora do store de propósito — sem Pinia e sem o alias `@`, o módulo pode
 * ser importado direto por scripts de verificação e testes unitários, que assim
 * exercitam a mesma formatação que as telas usam em vez de uma cópia dela.
 *
 * Os três cronogramas (aluno/docente, coordenação e página pública) derivam as
 * datas daqui, e é isso que garante que o texto exibido seja idêntico nos três.
 */

export const STEP_DEFINITIONS = [
  { label: 'Definição de vagas', icon: 'bi-paperclip', startField: 'vacancyDefStartDate', endField: 'vacancyDefEndDate', description: 'A coordenação define quantas vagas cada docente oferece no semestre.' },
  { label: 'Cadastro de temas', icon: 'bi-list-check', startField: 'themeRegStartDate', endField: 'themeRegEndDate', description: 'Docentes cadastram suas áreas e temas de orientação.' },
  { label: 'Período de busca', icon: 'bi-chat-left-text', startField: 'searchStartDate', endField: 'searchEndDate', description: 'Alunos buscam orientadores e enviam solicitações de orientação.' },
  { label: 'Análise solicitações', icon: 'bi-hourglass-split', startField: 'analysisStartDate', endField: 'analysisEndDate', description: 'Docentes analisam e respondem (aceitam ou recusam) às solicitações.' },
  { label: 'Confirmação vínculo', icon: 'bi-person-check', startField: 'linkConfirmStartDate', endField: 'linkConfirmEndDate', description: 'Os vínculos aceitos são oficializados no sistema.' },
  { label: 'Encerramento', icon: 'bi-lock', startField: 'closureDate', description: 'Fim do período de buscas por orientador.' },
  { label: 'Início orientações', icon: 'bi-pencil-square', startField: 'orientationStartDate', description: 'Começam as orientações com os vínculos firmados.' },
  { label: 'Homologação', icon: 'bi-graph-up', startField: 'homologationDate', description: 'Homologação final do processo pela coordenação.' },
];

export const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  // UTC para casar com a data que o coordenador cadastrou (salva como
  // YYYY-MM-DDT00:00:00Z); usar hora local causaria off-by-one em UTC-3.
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatRange = (start, end) => {
  if (!start && !end) return '';
  if (start && end) return `${formatDay(start)} a ${formatDay(end)}`;
  return formatDay(start || end);
};

export const isCurrent = (todayMs, start, end) => {
  if (!start) return false;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return false;
  const endMs = end ? new Date(end).getTime() : startMs;
  // Inclui o dia final inteiro.
  return todayMs >= startMs && todayMs <= endMs + (24 * 60 * 60 * 1000 - 1);
};

/**
 * Converte o semestre vindo da API nas etapas que os componentes renderizam.
 * @param {object|null} semester resposta de GET /semesters/active
 * @param {number} [todayMs] injetável para os testes não dependerem do relógio
 */
export const buildSteps = (semester, todayMs = Date.now()) =>
  STEP_DEFINITIONS.map((def) => {
    const start = semester?.[def.startField] || null;
    const end = def.endField ? semester?.[def.endField] || null : null;
    return {
      label: def.label,
      icon: def.icon,
      description: def.description,
      date: def.endField ? formatRange(start, end) : formatDay(start),
      active: isCurrent(todayMs, start, end),
    };
  });
