import { describe, it, expect } from 'vitest';
import { buildSteps, formatDay, formatRange, STEP_DEFINITIONS } from './timelineSteps';

// Cronograma completo, uma data distinta por campo: se dois campos trocarem de
// lugar no mapeamento, o valor errado aparece em vez de passar batido.
const SEMESTER = {
  id: 1,
  year: 2031,
  period: '1',
  isActive: true,
  vacancyDefStartDate: '2031-01-05T00:00:00.000Z',
  vacancyDefEndDate: '2031-01-20T23:59:59.999Z',
  themeRegStartDate: '2031-02-03T00:00:00.000Z',
  themeRegEndDate: '2031-02-18T23:59:59.999Z',
  searchStartDate: '2031-03-07T00:00:00.000Z',
  searchEndDate: '2031-03-22T23:59:59.999Z',
  analysisStartDate: '2031-04-02T00:00:00.000Z',
  analysisEndDate: '2031-04-17T23:59:59.999Z',
  linkConfirmStartDate: '2031-05-06T00:00:00.000Z',
  linkConfirmEndDate: '2031-05-21T23:59:59.999Z',
  closureDate: '2031-06-09T00:00:00.000Z',
  orientationStartDate: '2031-07-14T00:00:00.000Z',
  homologationDate: '2031-08-25T00:00:00.000Z',
};

describe('formatDay', () => {
  it('formata em UTC, sem off-by-one em fuso negativo', () => {
    // O coordenador grava a data como meia-noite UTC. Formatar com getDate()
    // local devolveria 04/01 em UTC-3 (Brasil) — o dia anterior ao escolhido.
    expect(formatDay('2031-01-05T00:00:00.000Z')).toBe('05/01/2031');
  });

  it('mantém o dia em datas de fim de dia', () => {
    expect(formatDay('2031-01-20T23:59:59.999Z')).toBe('20/01/2031');
  });

  it('devolve string vazia para valor ausente ou inválido', () => {
    expect(formatDay(null)).toBe('');
    expect(formatDay(undefined)).toBe('');
    expect(formatDay('')).toBe('');
    expect(formatDay('nao-e-data')).toBe('');
  });
});

describe('formatRange', () => {
  it('une início e fim', () => {
    expect(formatRange('2031-03-07T00:00:00.000Z', '2031-03-22T23:59:59.999Z'))
      .toBe('07/03/2031 a 22/03/2031');
  });

  it('com apenas uma das pontas, exibe só ela', () => {
    expect(formatRange('2031-03-07T00:00:00.000Z', null)).toBe('07/03/2031');
    expect(formatRange(null, '2031-03-22T00:00:00.000Z')).toBe('22/03/2031');
  });

  it('sem datas, devolve vazio', () => {
    expect(formatRange(null, null)).toBe('');
  });
});

describe('buildSteps', () => {
  const NOW = Date.UTC(2031, 2, 10); // 10/03/2031 — dentro do período de busca

  it('renderiza as 8 etapas com as datas do semestre', () => {
    const steps = buildSteps(SEMESTER, NOW);
    expect(steps.map((s) => [s.label, s.date])).toEqual([
      ['Definição de vagas', '05/01/2031 a 20/01/2031'],
      ['Cadastro de temas', '03/02/2031 a 18/02/2031'],
      ['Período de busca', '07/03/2031 a 22/03/2031'],
      ['Análise solicitações', '02/04/2031 a 17/04/2031'],
      ['Confirmação vínculo', '06/05/2031 a 21/05/2031'],
      ['Encerramento', '09/06/2031'],
      ['Início orientações', '14/07/2031'],
      ['Homologação', '25/08/2031'],
    ]);
  });

  it('não deixa etapa sem data quando o cronograma está completo', () => {
    // Foi exatamente esse o sintoma do bug do DTO: metade das etapas em branco
    // em todas as telas, mesmo depois de a coordenação salvar.
    expect(buildSteps(SEMESTER, NOW).filter((s) => !s.date)).toEqual([]);
  });

  it('marca como atual só a etapa que contém a data de hoje', () => {
    const ativos = buildSteps(SEMESTER, NOW).filter((s) => s.active).map((s) => s.label);
    expect(ativos).toEqual(['Período de busca']);
  });

  it('inclui o último dia inteiro do período', () => {
    const ultimoDia = Date.UTC(2031, 2, 22, 18, 0, 0); // 22/03 às 18h
    const ativos = buildSteps(SEMESTER, ultimoDia).filter((s) => s.active).map((s) => s.label);
    expect(ativos).toEqual(['Período de busca']);
  });

  it('sem semestre, devolve as etapas com data vazia em vez de quebrar', () => {
    const steps = buildSteps(null, NOW);
    expect(steps).toHaveLength(STEP_DEFINITIONS.length);
    expect(steps.every((s) => s.date === '' && s.active === false)).toBe(true);
    // Os rótulos continuam, para a linha do tempo aparecer mesmo sem datas.
    expect(steps[0].label).toBe('Definição de vagas');
  });

  it('é determinístico: mesma entrada, mesma saída para telas diferentes', () => {
    // As três telas (aluno/docente, coordenação e pública) chamam esta função
    // com a mesma resposta da API; é isto que garante texto idêntico.
    expect(buildSteps(SEMESTER, NOW)).toEqual(buildSteps(SEMESTER, NOW));
  });
});
