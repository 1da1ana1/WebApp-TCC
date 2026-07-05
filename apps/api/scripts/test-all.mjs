// Orquestrador de testes "tudo em um".
//
//   npm run test:all
//
// Faz, em ordem: sobe o Postgres de teste -> sincroniza o schema ->
// roda os testes unitários -> roda os e2e -> e SEMPRE derruba o container
// no final (mesmo se algum passo falhar). Cross-platform (Windows/Linux/mac),
// sem dependências extras: usa só o Node + os scripts já definidos no
// package.json.
//
// Flags:
//   --unit-only   roda só os unitários (não sobe o Docker)
//   --e2e-only    pula os unitários
//   --keep-db     não derruba o container ao final (útil para depurar)

import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const unitOnly = args.has('--unit-only');
const e2eOnly = args.has('--e2e-only');
const keepDb = args.has('--keep-db');

/** Roda `npm run <script>` herdando o stdio; lança se o passo falhar.
 *  `shell: true` é necessário no Windows para resolver o `npm.cmd`. */
function run(script, { label } = {}) {
  console.log(`\n▶  ${label ?? script}\n`);
  const result = spawnSync(`npm run ${script}`, {
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Passo "${script}" falhou (exit ${result.status}).`);
  }
}

let failure = null;
let dbUp = false;

try {
  // ---- Unitários (não precisam de banco) ----
  if (!e2eOnly) {
    run('test', { label: 'Testes unitários' });
  }

  // ---- e2e (precisam do Postgres efêmero) ----
  if (!unitOnly) {
    run('db:test:up', { label: 'Subindo Postgres de teste (Docker)' });
    dbUp = true;
    run('db:test:prepare', { label: 'Sincronizando schema no banco de teste' });
    run('test:e2e', { label: 'Testes e2e' });
  }
} catch (err) {
  failure = err;
} finally {
  if (dbUp && !keepDb) {
    // Teardown best-effort: não mascara a falha original.
    console.log('\n▶  Derrubando Postgres de teste\n');
    spawnSync('npm run db:test:down', { stdio: 'inherit', shell: true });
  }
}

if (failure) {
  console.error(`\n✖  ${failure.message}`);
  process.exit(1);
}
console.log('\n✔  Todos os testes passaram.');
