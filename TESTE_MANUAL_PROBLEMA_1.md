# 🧪 Guia de Teste Manual - Problema 1: Envio de Solicitação de Orientação

## ✅ Pré-requisitos Confirmados
- ✅ Backend rodando: http://localhost:3000
- ✅ Frontend rodando: http://localhost:5000
- ✅ Database PostgreSQL: localhost:6666
- ✅ Seed executado com dados de teste

## 📋 Credenciais de Teste
- **Aluno**: aluno@unicamp.br / 123456
- **Professor**: professor@unicamp.br / 123456
- **Coordenador**: coord@unicamp.br / 123456

## 🔍 Teste 1: Envio de Solicitação com Sucesso

### Passos:
1. **Abrir navegador** em http://localhost:5000
2. **Fazer login** como aluno:
   - Email: `aluno@unicamp.br`
   - Senha: `123456`
3. **Navegar** para página de busca de orientadores
   - Verificar se há professores listados
4. **Clicar** em "Ver Perfil" de um professor
5. **Verificar** que o botão "Enviar Solicitação" está habilitado
6. **Clicar** em "Enviar Solicitação"
7. **Verificar** modal de confirmação aparece
8. **Clicar** em "Confirmar Solicitação"

### Resultado Esperado:
- ✅ Botão mostra "Enviando..." durante processamento
- ✅ SweetAlert verde aparece: "Solicitação enviada para [Nome do Professor]"
- ✅ Botão muda para "Solicitação Enviada" e fica **desabilitado**
- ✅ Console do navegador não mostra erros

### Verificação Backend:
```sql
-- Conectar ao PostgreSQL
-- Verificar solicitação criada
SELECT * FROM "Request" WHERE "studentId" IN (
  SELECT id FROM "Student" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'aluno@unicamp.br'
  )
) ORDER BY "sendDate" DESC LIMIT 1;

-- Deve mostrar registro com status = 'PENDING'
```

### Verificação de Logs:
- Abrir DevTools do navegador (F12)
- Ir para aba **Network**
- Filtrar por `requests`
- Verificar chamada `POST /api/requests` com status **201 Created**
- Verificar payload enviado: `{ "teacherId": [número] }`
- Verificar resposta contém `{ "id": ..., "status": "PENDING", ... }`

---

## 🔍 Teste 2: Tentativa de Enviar Segunda Solicitação

### Passos:
1. **Após completar Teste 1**, permanecer na mesma página
2. **Observar** estado do botão

### Resultado Esperado:
- ✅ Botão permanece desabilitado
- ✅ Texto do botão: "Solicitação Enviada"
- ✅ Passar mouse sobre botão mostra tooltip: "Você já possui uma solicitação pendente"
- ✅ Não é possível clicar no botão

---

## 🔍 Teste 3: Recarregar Página com Solicitação Pendente

### Passos:
1. **Após completar Teste 1**, pressionar **F5** para recarregar a página
2. **Aguardar** carregamento completo

### Resultado Esperado:
- ✅ Botão já carrega **desabilitado** desde o início
- ✅ Texto: "Solicitação Enviada"
- ✅ Sistema detectou automaticamente a solicitação pendente

### Verificação Técnica:
- Abrir DevTools → Network
- Verificar duas chamadas na inicialização:
  1. `GET /api/teachers/[id]` - buscar dados do professor (200 OK)
  2. `GET /api/requests` - buscar solicitações do aluno (200 OK)
- Na resposta de `/api/requests`, deve haver pelo menos um item com `"status": "PENDING"`

---

## 🔍 Teste 4: Mensagem de Erro do Backend (Solicitação Duplicada)

### Passos:
1. **Após completar Teste 1**, abrir **DevTools Console** (F12)
2. **Executar** código JavaScript para forçar envio duplicado:
```javascript
// Assumindo que você está na página do perfil do professor
// Obter teacherId da URL ou variável
const teacherId = window.location.pathname.split('/').pop();

// Tentar criar segunda solicitação manualmente
fetch('/api/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token') // ou sessionStorage
  },
  body: JSON.stringify({ teacherId: parseInt(teacherId) })
})
.then(r => r.json())
.then(data => console.log('Resposta:', data))
.catch(err => console.error('Erro:', err));
```

### Resultado Esperado:
- ✅ Console mostra erro 400 Bad Request
- ✅ Mensagem de erro: `"Você já possui uma solicitação pendente"`
- ✅ (Se SweetAlert for acionado) Alerta vermelho com mensagem específica

---

## 🔍 Teste 5: Fluxo do Professor (Verificação de Notificação)

### Passos:
1. **Fazer logout** do aluno
2. **Fazer login** como professor:
   - Email: `professor@unicamp.br`
   - Senha: `123456`
3. **Navegar** para página de notificações ou solicitações
4. **Verificar** lista de notificações

### Resultado Esperado:
- ✅ Notificação aparece indicando nova solicitação do aluno
- ✅ Professor pode ver detalhes da solicitação
- ✅ Professor tem opções de Aprovar/Rejeitar

---

## 🔍 Teste 6: Cenário de Erro - Professor Inexistente

### Passos:
1. **Login como aluno** (aluno@unicamp.br)
2. **Abrir DevTools Console**
3. **Executar** código para tentar criar solicitação com ID inválido:
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
.then(data => console.log('Resposta:', data));
```

### Resultado Esperado:
- ✅ Status 404 Not Found
- ✅ Mensagem: `"Professor não encontrado"` ou similar

---

## 🔍 Teste 7: Cenário de Erro - Sem Autenticação

### Passos:
1. **Abrir aba anônima** ou fazer logout
2. **Abrir DevTools Console**
3. **Tentar** chamar API sem token:
```javascript
fetch('http://localhost:5000/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ teacherId: 1 })
})
.then(r => r.json())
.then(data => console.log('Resposta:', data));
```

### Resultado Esperado:
- ✅ Status 401 Unauthorized
- ✅ Mensagem de erro de autenticação

---

## 📊 Checklist Final

Após executar todos os testes, confirme:

- [ ] Solicitação criada com sucesso (Teste 1) ✅
- [ ] Status PENDING no banco de dados ✅
- [ ] Botão desabilitado após envio (Teste 1) ✅
- [ ] Botão permanece desabilitado (Teste 2) ✅
- [ ] Página recarregada detecta solicitação pendente (Teste 3) ✅
- [ ] Erro de duplicidade tratado corretamente (Teste 4) ✅
- [ ] Notificação criada para professor (Teste 5) ✅
- [ ] Erro de professor inexistente tratado (Teste 6) ✅
- [ ] Autenticação obrigatória funcionando (Teste 7) ✅
- [ ] Console sem erros JavaScript ✅
- [ ] UI responsiva e sem bugs visuais ✅

---

## 🐛 Problemas Encontrados (para documentar)

| Teste | Problema | Status | Solução |
|-------|----------|--------|---------|
| - | - | - | - |

---

## ✅ Status dos Testes

**Data**: [A preencher]
**Testador**: [A preencher]
**Ambiente**: Development (localhost)

**Resultado Geral**: ⬜ APROVADO / ⬜ REPROVADO

**Observações**:
- 
- 
- 
