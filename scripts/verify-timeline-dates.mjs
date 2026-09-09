#!/usr/bin/env node
/**
 * Verifica que o cronograma definido pela coordenação chega íntegro e IDÊNTICO
 * a todos os pontos onde datas aparecem:
 *
 *   1. página pública        (sem autenticação)
 *   2. perfil do aluno       (token STUDENT)
 *   3. painel do docente     (token TEACHER)
 *   4. painel da coordenação (token COORDINATOR)
 *
 * O que ele testa, em três camadas:
 *
 *   PERSISTÊNCIA — grava as 13 datas do cronograma e confere que nenhuma volta
 *   nula. Este é o teste que pega a falha de origem: o ValidationPipe roda com
 *   `whitelist: true`, então qualquer data ausente do CreateSemesterDto era
 *   descartada em silêncio, com resposta 201 e mensagem de sucesso na tela.
 *
 *   IGUALDADE — compara os quatro leitores campo a campo. Como as telas leem o
 *   mesmo GET /semesters/active, divergência aqui significaria filtro por
 *   papel ou cache indevido.
 *
 *   RENDERIZAÇÃO — passa cada resposta por buildSteps(), a função real que os
 *   três componentes de cronograma usam, e compara os textos finais. É o que
 *   prova a igualdade do que o usuário lê, não só do JSON.
 *
 * ATENÇÃO: cria um semestre novo e ativo no banco apontado pela API, o que
 * desativa o semestre ativo anterior (regra do próprio serviço). Rode contra
 * banco de desenvolvimento ou de teste. O semestre anterior é impresso antes da
 * escrita para que nada se perca de vista.
 *
 * Uso:
 *   node scripts/verify-timeline-dates.mjs
 *   API_URL=http://127.0.0.1:3000 node scripts/verify-timeline-dates.mjs
 *   WEB_URL=http://127.0.0.1:5000 node scripts/verify-timeline-dates.mjs   # inclui o proxy do Vite
 */

import { buildSteps, STEP_DEFINITIONS } from '../apps/web/src/utils/timelineSteps.js';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3000';
const WEB_URL = process.env.WEB_URL ?? 'http://127.0.0.1:5000';
const PASSWORD = process.env.SEED_PASSWORD ?? '123456';

const ACCOUNTS = {
  coordinator: process.env.COORD_EMAIL ?? 'coord@unicamp.br',
  student: process.env.STUDENT_EMAIL ?? 'aluno@unicamp.br',
  teacher: process.env.TEACHER_EMAIL ?? 'professor@unicamp.br',
};

// Uma data distinta por campo: se dois campos forem trocados de lugar em algum
// mapeamento, o valor errado aparece em vez de passar despercebido.
const YEAR = Number(process.env.TEST_YEAR ?? 2031);
const D = (mmdd, end = false) =>
  `${YEAR}-${mmdd}T${end ? '23:59:59.999' : '00:00:00.000'}Z`;

const SCHEDULE = {
  vacancyDefStartDate: D('01-05'),
  vacancyDefEndDate: D('01-20', true),
  themeRegStartDate: D('02-03'),
  themeRegEndDate: D('02-18', true),
  searchStartDate: D('03-07'),
  searchEndDate: D('03-22', true),
  analysisStartDate: D('04-02'),
  analysisEndDate: D('04-17', true),
  linkConfirmStartDate: D('05-06'),
  linkConfirmEndDate: D('05-21', true),
  closureDate: D('06-09'),
  orientationStartDate: D('07-14'),
  homologationDate: D('08-25'),
};

const DATE_FIELDS = Object.keys(SCHEDULE);

// Texto que cada etapa deve exibir, na ordem da linha do tempo.
const EXPECTED_LABELS = [
  ['Definição de vagas', `05/01/${YEAR} a 20/01/${YEAR}`],
  ['Cadastro de temas', `03/02/${YEAR} a 18/02/${YEAR}`],
  ['Período de busca', `07/03/${YEAR} a 22/03/${YEAR}`],
  ['Análise solicitações', `02/04/${YEAR} a 17/04/${YEAR}`],
  ['Confirmação vínculo', `06/05/${YEAR} a 21/05/${YEAR}`],
  ['Encerramento', `09/06/${YEAR}`],
  ['Início orientações', `14/07/${YEAR}`],
  ['Homologação', `25/08/${YEAR}`],
];

// ── Saída ───────────────────────────────────────────────────────────
const C = { r: '\x1b[31m', g: '\x1b[32m', y: '\x1b[33m', b: '\x1b[1m', d: '\x1b[2m', x: '\x1b[0m' };
let passed = 0;
const failures = [];

const section = (t) => console.log(`\n${C.b}${t}${C.x}`);
const ok = (t) => { passed++; console.log(`  ${C.g}✓${C.x} ${t}`); };
const fail = (t, detail) => {
  failures.push({ t, detail });
  console.log(`  ${C.r}✗${C.x} ${t}`);
  if (detail) console.log(`      ${C.r}${detail}${C.x}`);
};
const check = (cond, t, detail) => (cond ? ok(t) : fail(t, detail));
const info = (t) => console.log(`  ${C.d}${t}${C.x}`);

// ── HTTP ────────────────────────────────────────────────────────────
async function login(email) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${email} → HTTP ${res.status} ${await res.text()}`);
  const body = await res.json();
  if (!body.access_token) throw new Error(`login ${email}: resposta sem access_token`);
  return body.access_token;
}

async function getActiveSemester(baseUrl, token, pathPrefix = '') {
  const res = await fetch(`${baseUrl}${pathPrefix}/semesters/active`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`GET ${pathPrefix}/semesters/active → HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function reachable(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2500) });
    return true;
  } catch {
    return false;
  }
}

// ── Fluxo ───────────────────────────────────────────────────────────
async function main() {
  console.log(`${C.b}Verificação do cronograma — datas da coordenação em todas as telas${C.x}`);
  info(`API: ${API_URL}`);

  if (!(await reachable(`${API_URL}/`))) {
    console.error(`\n${C.r}API inacessível em ${API_URL}.${C.x}`);
    console.error(`Suba com: cd apps/api && npm run start:dev`);
    process.exit(2);
  }

  // ── 1. Autenticação dos três papéis ──────────────────────────────
  section('1. Autenticação dos três papéis');
  const tokens = {};
  for (const [role, email] of Object.entries(ACCOUNTS)) {
    tokens[role] = await login(email);
    ok(`login ${role} (${email})`);
  }

  // ── 2. Estado anterior ───────────────────────────────────────────
  section('2. Semestre ativo antes da escrita');
  const before = await getActiveSemester(API_URL, tokens.coordinator);
  if (before) {
    info(`id=${before.id} ${before.year}/${before.period} — será desativado ao criar o novo`);
  } else {
    info('nenhum semestre ativo');
  }

  // ── 3. Coordenação grava o cronograma ────────────────────────────
  section('3. Coordenação grava as 13 datas (POST /semesters)');
  const payload = { year: YEAR, period: '1', isActive: true, ...SCHEDULE };
  const res = await fetch(`${API_URL}/semesters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.coordinator}` },
    body: JSON.stringify(payload),
  });
  const created = await res.json();
  check(res.status === 201, `POST /semesters → 201`, `recebido HTTP ${res.status}: ${JSON.stringify(created)}`);

  // Persistência campo a campo. Uma data descartada pelo whitelist do
  // ValidationPipe aparece aqui como null, mesmo com a resposta 201.
  const dropped = [];
  for (const field of DATE_FIELDS) {
    const saved = created?.[field];
    if (!saved) {
      dropped.push(field);
    } else if (new Date(saved).toISOString() !== new Date(SCHEDULE[field]).toISOString()) {
      fail(`${field} gravado com valor diferente`, `esperado ${SCHEDULE[field]}, recebido ${saved}`);
    }
  }
  check(
    dropped.length === 0,
    `as ${DATE_FIELDS.length} datas foram persistidas`,
    dropped.length ? `descartadas (voltaram null): ${dropped.join(', ')}` : null,
  );

  // Toda etapa da linha do tempo precisa ter campo correspondente gravado —
  // pega o caso de uma etapa existir na UI sem nada por trás.
  for (const def of STEP_DEFINITIONS) {
    const hasStart = Boolean(created?.[def.startField]);
    check(hasStart, `etapa "${def.label}" tem ${def.startField} no banco`);
  }

  // ── 4. Os quatro leitores ────────────────────────────────────────
  section('4. Leitura pelos quatro pontos de exibição');
  const readers = {
    'página pública (sem token)': await getActiveSemester(API_URL, null),
    'perfil do aluno': await getActiveSemester(API_URL, tokens.student),
    'painel do docente': await getActiveSemester(API_URL, tokens.teacher),
    'painel da coordenação': await getActiveSemester(API_URL, tokens.coordinator),
  };

  // O proxy do Vite é o caminho que o navegador realmente usa (/api → :3000).
  if (await reachable(`${WEB_URL}/`)) {
    readers['SPA via proxy do Vite (/api)'] = await getActiveSemester(WEB_URL, null, '/api');
    info(`proxy do Vite incluído (${WEB_URL}/api)`);
  } else {
    info(`front não está no ar em ${WEB_URL} — proxy do Vite não verificado`);
  }

  for (const [who, semester] of Object.entries(readers)) {
    check(semester?.id === created.id, `${who} vê o semestre recém-salvo (id=${created.id})`,
      `recebido id=${semester?.id ?? 'null'}`);
  }

  // ── 5. Igualdade do JSON entre leitores ──────────────────────────
  section('5. Datas idênticas entre os leitores (campo a campo)');
  const names = Object.keys(readers);
  const base = names[0];
  for (const field of DATE_FIELDS) {
    const ref = readers[base]?.[field] ?? null;
    const divergentes = names.filter((n) => (readers[n]?.[field] ?? null) !== ref);
    check(divergentes.length === 0, `${field} igual em todos`,
      divergentes.length ? `divergem de "${base}" (${ref}): ${divergentes.map((n) => `${n}=${readers[n]?.[field] ?? 'null'}`).join(', ')}` : null);
  }

  // ── 6. Texto renderizado ─────────────────────────────────────────
  section('6. Texto exibido na tela (buildSteps — a função real dos componentes)');
  // Relógio fixo: `active` depende de "hoje" e não deve variar entre leitores.
  const NOW = Date.UTC(YEAR, 2, 10);
  const rendered = Object.fromEntries(
    Object.entries(readers).map(([who, s]) => [who, buildSteps(s, NOW)]),
  );

  EXPECTED_LABELS.forEach(([label, expected], i) => {
    const got = rendered[base][i];
    check(got.label === label, `etapa ${i + 1} é "${label}"`, `recebido "${got.label}"`);
    check(got.date === expected, `  exibe "${expected}"`, `recebido "${got.date}"`);

    const divergentes = names.filter((n) => rendered[n][i].date !== got.date);
    check(divergentes.length === 0, `  idêntico nos ${names.length} pontos de exibição`,
      divergentes.length ? divergentes.map((n) => `${n}="${rendered[n][i].date}"`).join(', ') : null);
  });

  section('7. Nenhuma etapa com data vazia');
  const vazias = rendered[base].filter((s) => !s.date).map((s) => s.label);
  check(vazias.length === 0, 'todas as 8 etapas exibem data',
    vazias.length ? `sem data: ${vazias.join(', ')}` : null);

  // ── Linha do tempo, como o usuário vê ────────────────────────────
  section('Cronograma resultante');
  for (const s of rendered[base]) {
    console.log(`  ${s.active ? C.y + '▶' + C.x : ' '} ${s.label.padEnd(22)} ${s.date}`);
  }

  // ── Resumo ───────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(66)}`);
  if (failures.length === 0) {
    console.log(`${C.g}${C.b}TUDO OK${C.x} — ${passed} verificações passaram.`);
    console.log(`As datas da coordenação aparecem idênticas nos ${names.length} pontos de exibição.`);
  } else {
    console.log(`${C.r}${C.b}${failures.length} FALHA(S)${C.x} — ${passed} passaram.`);
    for (const f of failures) console.log(`  ${C.r}✗${C.x} ${f.t}${f.detail ? ` — ${f.detail}` : ''}`);
  }
  console.log(`${'─'.repeat(66)}`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`\n${C.r}Erro inesperado:${C.x} ${err.message}`);
  process.exit(2);
});
