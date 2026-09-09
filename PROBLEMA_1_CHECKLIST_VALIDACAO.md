# ✅ PROBLEMA 1 - CHECKLIST DE VALIDAÇÃO

## 🎯 Objetivo
Verificar que a funcionalidade de **envio de solicitação de orientação** está 100% funcional.

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar os testes, confirme:

- [ ] Backend rodando em `http://localhost:3000`
  ```bash
  cd apps/api
  npm run start:dev
  ```

- [ ] Frontend rodando em `http://localhost:5000`
  ```bash
  cd apps/web
  npm run dev
  ```

- [ ] Banco de dados PostgreSQL conectado (porta 6666)

- [ ] Seed executado (dados de teste disponíveis)
  ```bash
  cd apps/api
  npm run seed
  ```

---

## ✅ VALIDAÇÃO FUNCIONAL

### 1. Fluxo de Sucesso - Primeira Solicitação

- [ ] **Login como aluno**
  - Email: `aluno@unicamp.br`
  - Senha: `123456`
  
- [ ] **Navegação para busca de orientadores**
  - Lista de professores aparece
  
- [ ] **Clique em "Ver Perfil" de um professor**
  - Perfil carrega corretamente
  - Botão "Enviar Solicitação" está **habilitado** (azul, clicável)
  
- [ ] **Clique em "Enviar Solicitação"**
  - Modal de confirmação aparece
  - Texto: "Você deseja enviar uma solicitação de orientação para [Nome]?"
  
- [ ] **Clique em "Confirmar Solicitação"**
  - Botão mostra "Enviando..." (loading state)
  - Botões do modal ficam desabilitados durante processamento
  
- [ ] **Após sucesso**
  - Modal fecha automaticamente
  - SweetAlert verde aparece: "Sucesso!"
  - Mensagem: "Solicitação enviada para [Nome do Professor]"
  - Alerta fecha sozinho após ~3 segundos
  
- [ ] **Verificar estado do botão**
  - Texto mudou para: "Solicitação Enviada"
  - Botão está **desabilitado** (cinza, opaco)
  - Cursor muda para "not-allowed" ao passar mouse
  - Tooltip aparece: "Você já possui uma solicitação pendente"

---

### 2. Persistência de Estado

- [ ] **Com a solicitação já enviada, pressionar F5 (recarregar página)**
  - Página recarrega
  - Botão já carrega **desabilitado** desde o início
  - Texto: "Solicitação Enviada"
  
- [ ] **Navegar para outra página e voltar**
  - Estado permanece: botão desabilitado

---

### 3. Validação de Duplicidade

- [ ] **Tentar clicar no botão desabilitado**
  - Nada acontece (modal não abre)
  
- [ ] **Abrir DevTools Console (F12)**
  
- [ ] **Executar script para forçar envio duplicado**:
  ```javascript
  fetch('/api/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ teacherId: 1 })
  })
  .then(r => r.json())
  .then(console.log)
  ```
  
- [ ] **Verificar resposta no console**
  - Status: `400 Bad Request`
  - Mensagem: `"Você já possui uma solicitação pendente"` ou similar

---

### 4. Verificação Backend (Banco de Dados)

- [ ] **Conectar ao PostgreSQL**
  ```bash
  psql -h localhost -p 6666 -U postgres -d webapp
  ```
  
- [ ] **Verificar solicitação criada**
  ```sql
  SELECT r.id, r.status, r."sendDate", 
         s."ra" AS aluno_ra,
         u.name AS professor_nome
  FROM "Request" r
  JOIN "Student" s ON r."studentId" = s.id
  JOIN "Teacher" t ON r."teacherId" = t.id
  JOIN "User" u ON t."userId" = u.id
  WHERE s."ra" = '111111'  -- RA do aluno de teste
  ORDER BY r."sendDate" DESC
  LIMIT 1;
  ```
  
- [ ] **Verificar campos da solicitação**
  - `status` = `'PENDING'`
  - `sendDate` preenchido
  - `responseDate` = `NULL`
  - `justification` = `NULL`
  
- [ ] **Verificar notificação criada para o professor**
  ```sql
  SELECT n.id, n.message, n."isRead", n."createdAt", n.type,
         u.name AS professor_nome
  FROM "Notification" n
  JOIN "User" u ON n."userId" = u.id
  WHERE u."typeUser" = 'TEACHER'
  ORDER BY n."createdAt" DESC
  LIMIT 1;
  ```
  
- [ ] **Verificar campos da notificação**
  - `message` contém "solicitação" ou "request"
  - `isRead` = `false`
  - `type` = `'REQUEST'` ou similar
  - `createdAt` próximo ao horário do teste

---

### 5. Verificação de Rede (DevTools)

- [ ] **Abrir DevTools → Aba Network**
  
- [ ] **Recarregar página do perfil do professor**
  
- [ ] **Verificar chamadas na inicialização**
  - [ ] `GET /api/teachers/[id]` → Status 200 OK
  - [ ] `GET /api/requests` → Status 200 OK
  
- [ ] **Limpar Network log e enviar nova solicitação (com outro aluno se necessário)**
  
- [ ] **Verificar chamada de criação**
  - [ ] `POST /api/requests` → Status 201 Created
  
- [ ] **Inspecionar Request Payload**
  ```json
  {
    "teacherId": [número]
  }
  ```
  
- [ ] **Inspecionar Response**
  ```json
  {
    "id": [número],
    "studentId": [número],
    "teacherId": [número],
    "status": "PENDING",
    "sendDate": "[timestamp]",
    "responseDate": null,
    "justification": null
  }
  ```

---

### 6. Teste de Erro - Professor Inexistente

- [ ] **Abrir DevTools Console**
  
- [ ] **Executar**:
  ```javascript
  fetch('/api/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ teacherId: 999999 })
  })
  .then(r => r.json())
  .then(console.log)
  ```
  
- [ ] **Verificar resposta**
  - Status: `404 Not Found`
  - Mensagem: `"Professor não encontrado"` ou similar

---

### 7. Teste de Erro - Sem Autenticação

- [ ] **Fazer logout ou abrir aba anônima**
  
- [ ] **Tentar acessar** `http://localhost:5000/teachers/1`
  - Deve redirecionar para login OU mostrar erro

- [ ] **No console, tentar criar solicitação sem token**:
  ```javascript
  fetch('http://localhost:5000/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId: 1 })
  })
  .then(r => r.json())
  .then(console.log)
  ```
  
- [ ] **Verificar resposta**
  - Status: `401 Unauthorized`

---

### 8. Teste do Lado do Professor

- [ ] **Fazer logout do aluno**
  
- [ ] **Login como professor**
  - Email: `professor@unicamp.br`
  - Senha: `123456`
  
- [ ] **Navegar para notificações ou solicitações**
  
- [ ] **Verificar**
  - Nova notificação aparece
  - Detalhes da solicitação do aluno estão visíveis
  - Opções de Aprovar/Rejeitar disponíveis

---

## 🎨 VALIDAÇÃO VISUAL/UX

### Botão Habilitado (Sem Solicitação Pendente)
- [ ] Cor de fundo: azul (`var(--color-button-primary)`)
- [ ] Borda: azul escuro (`#0e4392`)
- [ ] Texto: "Enviar Solicitação"
- [ ] Cursor: `pointer` (mãozinha)
- [ ] Hover: opacidade reduz levemente (80%)
- [ ] Clicável: modal abre

### Botão Desabilitado (Com Solicitação Pendente)
- [ ] Cor de fundo: cinza (`#6c757d`)
- [ ] Borda: cinza escuro (`#5a6268`)
- [ ] Texto: "Solicitação Enviada"
- [ ] Opacidade: 50%
- [ ] Cursor: `not-allowed` (proibido)
- [ ] Hover: sem efeito de opacidade
- [ ] Tooltip: "Você já possui uma solicitação pendente"
- [ ] Não clicável: modal não abre

### Modal de Confirmação
- [ ] Fundo escuro com blur (`backdrop-filter: blur(2px)`)
- [ ] Card branco centralizado
- [ ] Título: "Confirmar Envio"
- [ ] Texto dinâmico com nome do professor
- [ ] Dois botões:
  - [ ] "Cancelar Envio" (vermelho)
  - [ ] "Confirmar Solicitação" (verde)
- [ ] Durante envio:
  - [ ] Botão confirmar: texto muda para "Enviando..."
  - [ ] Ambos botões desabilitados
  - [ ] Não é possível fechar modal clicando fora

### SweetAlert de Sucesso
- [ ] Ícone: ✅ (verde)
- [ ] Título: "Sucesso!"
- [ ] Mensagem: "Solicitação enviada para [Nome]."
- [ ] Cor do botão: verde (`var(--color-status-success)`)
- [ ] Timer: fecha automaticamente após 3 segundos
- [ ] Animação suave de entrada

### SweetAlert de Erro
- [ ] Ícone: ❌ (vermelho)
- [ ] Título: "Erro!"
- [ ] Mensagem: específica do backend (ex: "Você já possui uma solicitação pendente")
- [ ] Cor do botão: vermelho (`var(--color-status-danger)`)
- [ ] Não fecha automaticamente (requer clique)

---

## 🐛 VALIDAÇÃO DE CONSOLE (Sem Erros)

- [ ] **Abrir DevTools Console**
  
- [ ] **Durante todo o fluxo, verificar que NÃO aparecem**:
  - [ ] Erros JavaScript (vermelho)
  - [ ] Avisos de rede (failed requests)
  - [ ] Erros de CORS
  - [ ] Erros 404 ou 500
  
- [ ] **Apenas logs esperados**:
  - `[Vite]` logs (hot reload)
  - Logs de sucesso de API calls

---

## 📊 RESULTADO ESPERADO

### ✅ Todos os itens acima marcados?

**SIM** → Funcionalidade está 100% operacional! 🎉

**NÃO** → Anotar qual item falhou e reportar:

**Item que falhou**: _______________________________

**Comportamento observado**: _______________________________

**Comportamento esperado**: _______________________________

**Mensagem de erro (se houver)**: _______________________________

---

## 📁 DOCUMENTAÇÃO ADICIONAL

Para mais detalhes técnicos, consultar:

- **Solução completa**: `PROBLEMA_1_RESOLUCAO_COMPLETA.md`
- **Antes vs Depois**: `PROBLEMA_1_ANTES_DEPOIS.md`
- **Guia de testes manuais**: `TESTE_MANUAL_PROBLEMA_1.md`
- **Testes E2E**: `apps/api/test/request-validation.e2e-spec.ts`

---

## ✅ ASSINATURA DE VALIDAÇÃO

**Testado por**: _______________________________

**Data**: _______________________________

**Resultado**: ⬜ APROVADO  /  ⬜ REPROVADO

**Observações**:
_______________________________________________
_______________________________________________
_______________________________________________
