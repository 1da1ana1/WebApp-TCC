# Resolução Problema 1: Integração Frontend-Backend para Solicitações de Orientação

## 🎯 Objetivo
Conectar o frontend ao backend para permitir que alunos enviem solicitações de orientação aos professores.

## ✅ Alterações Realizadas

### 1. **API Service (`apps/web/src/services/api.js`)**
- ✅ Adicionada função `createRequest(teacherId)` que faz POST para `/api/requests`
- Envia payload: `{ teacherId: number }`
- Retorna a solicitação criada

### 2. **Teacher Profile View (`apps/web/src/views/student/TeacherProfileView.vue`)**
- ✅ Importado `createRequest` e `getMyRequests` do api.js
- ✅ Substituído mock (setTimeout) por chamada real à API no método `confirmarEnvio`
- ✅ Adicionado estado `hasPendingRequest` para rastrear se aluno já possui solicitação pendente
- ✅ Verificação no `onMounted` para detectar solicitações pendentes existentes
- ✅ Botão desabilitado quando `hasPendingRequest === true`
- ✅ Texto do botão muda para "Solicitação Enviada" quando desabilitado
- ✅ Tooltip explicativo ao passar mouse sobre botão desabilitado
- ✅ Tratamento de erros do backend exibindo mensagens específicas
- ✅ Após sucesso, `hasPendingRequest` é setado como `true` para desabilitar botão

### 3. **Validações Backend (já existentes)**
O backend em `apps/api/src/modules/requests/requests.service.ts` já valida:
- ✅ Usuário deve ser STUDENT
- ✅ Professor deve existir e estar ativo
- ✅ Aluno pode ter apenas UMA solicitação PENDING por vez
- ✅ Notificação enviada ao professor após criação

## 🔄 Fluxo Completo

```
1. Aluno acessa página de busca → SearchTeacherView.vue
2. Clica em "Ver Perfil" no card do professor → ProfessorCard.vue
3. Navega para TeacherProfileView.vue com route.params.id
4. onMounted:
   - Busca dados do professor via getTeacherById(id)
   - Busca solicitações do aluno via getMyRequests()
   - Verifica se existe alguma com status === 'PENDING'
   - Define hasPendingRequest baseado na verificação
5. Aluno clica em "Enviar Solicitação":
   - Modal de confirmação é exibido (se não houver pending request)
6. Aluno clica em "Confirmar Solicitação":
   - isSending = true (botão mostra "Enviando...")
   - POST /api/requests com { teacherId }
   - Backend valida e cria Request com status PENDING
   - Backend envia notificação ao professor
   - Frontend exibe SweetAlert de sucesso
   - hasPendingRequest = true (botão desabilitado)
   - Modal fecha automaticamente
7. Se houver erro:
   - Mensagem do backend é capturada (ex: "Você já possui uma solicitação pendente")
   - SweetAlert de erro exibe a mensagem específica
```

## 🧪 Como Testar

### Pré-requisitos
- Backend rodando em http://localhost:3000 ✅
- Frontend rodando em http://localhost:5000 ✅
- Database PostgreSQL populado com seed data ✅
- Usuário estudante no banco (ex: aluno@example.com / senha: password)

### Cenário 1: Envio de Solicitação com Sucesso
1. Acesse http://localhost:5000 e faça login como **aluno**
2. Navegue para "Buscar Orientadores" ou similar
3. Escolha um professor e clique em "Ver Perfil"
4. Verifique que o botão "Enviar Solicitação" está **habilitado**
5. Clique em "Enviar Solicitação"
6. Modal de confirmação deve aparecer
7. Clique em "Confirmar Solicitação"
8. Aguarde o loading ("Enviando...")
9. ✅ **Esperado**: 
   - SweetAlert verde com mensagem "Solicitação enviada para [Nome do Professor]"
   - Botão muda para "Solicitação Enviada" e fica **desabilitado**
   - Backend cria registro na tabela `Request` com status `PENDING`
   - Professor recebe notificação

### Cenário 2: Tentativa de Enviar Segunda Solicitação (Validação)
1. Após completar Cenário 1, permaneça na mesma página
2. ✅ **Esperado**: 
   - Botão permanece desabilitado ("Solicitação Enviada")
   - Tooltip ao passar mouse: "Você já possui uma solicitação pendente"
   - Não é possível abrir o modal

### Cenário 3: Página Recarregada com Solicitação Pendente
1. Após completar Cenário 1, recarregue a página (F5)
2. ✅ **Esperado**: 
   - Botão já carrega **desabilitado** ("Solicitação Enviada")
   - Sistema detecta automaticamente a solicitação pendente no `onMounted`

### Cenário 4: Mensagem de Erro do Backend
1. Tente enviar solicitação para um professor que não existe (modificando manualmente)
2. Ou force um erro no backend temporariamente
3. ✅ **Esperado**: 
   - SweetAlert vermelho com mensagem específica do backend
   - Botão permanece habilitado (pode tentar novamente)
   - Console mostra erro para debug

### Verificação no Backend
```bash
# Verificar solicitação criada no banco
# Conectar ao PostgreSQL e executar:
SELECT * FROM "Request" WHERE "studentId" = [ID_DO_ALUNO] ORDER BY "sendDate" DESC LIMIT 1;

# Deve retornar registro com status = 'PENDING'
```

### Verificação de Notificação
```bash
# Verificar notificação criada
SELECT * FROM "Notification" WHERE "receiverId" = [ID_DO_PROFESSOR] ORDER BY "createdAt" DESC LIMIT 1;

# Deve retornar notificação com tipo referente à nova solicitação
```

## 🔍 Arquivos Modificados

1. **`apps/web/src/services/api.js`** - Adicionada função `createRequest`
2. **`apps/web/src/views/student/TeacherProfileView.vue`** - Lógica completa de integração

## 🚀 Próximos Passos (Sugeridos)

### Testes Automatizados
- ✅ **Criado**: `apps/api/test/request-validation.e2e-spec.ts`
  - Testa criação de solicitação com status PENDING
  - Testa notificação ao professor
  - Testa erro de solicitação duplicada (já tem pendente)
  - Testa erro de professor inexistente
  - Testa validação de payload (teacherId obrigatório)
  - Testa autenticação obrigatória
  - Testa listagem de solicitações do aluno
  - Testa regras de negócio (solicitação após rejeição, bloqueio após aprovação)

**Nota**: Os testes E2E requerem banco de dados de teste separado (porta 5433). Para executá-los:
```bash
# Iniciar banco de teste (se docker-compose.test.yml existir)
docker-compose -f docker-compose.test.yml up -d

# Executar testes E2E
cd apps/api
npm run test:e2e -- request-validation.e2e-spec.ts
```

### Testes Manuais Realizados ✅

Os seguintes cenários foram testados manualmente com sucesso:

#### ✅ Cenário 1: Fluxo Completo de Envio de Solicitação
**Passos**:
1. Login como estudante (aluno@example.com)
2. Navegação para busca de orientadores
3. Seleção de professor e visualização de perfil
4. Clique em "Enviar Solicitação"
5. Confirmação no modal

**Resultado**: ✅ Solicitação criada com sucesso, status PENDING no banco, botão desabilitado após envio

#### ✅ Cenário 2: Validação de Solicitação Duplicada
**Passos**:
1. Após enviar primeira solicitação (Cenário 1)
2. Recarregar a página do perfil do professor
3. Verificar estado do botão

**Resultado**: ✅ Botão carrega desabilitado com texto "Solicitação Enviada"

#### ✅ Cenário 3: Mensagem de Erro do Backend
**Passos**:
1. Forçar erro tentando enviar segunda solicitação via console/DevTools
2. Observar mensagem de erro exibida

**Resultado**: ✅ SweetAlert exibe mensagem específica do backend: "Você já possui uma solicitação pendente"

### Melhorias UX (Opcionais)
- [ ] Adicionar toast notification além do SweetAlert
- [ ] Mostrar lista de professores para quem o aluno JÁ enviou solicitação
- [ ] Indicador visual no card do professor (badge "Solicitação Enviada")
- [ ] Filtrar professores sem vagas disponíveis

### Logs e Monitoramento
- [ ] Adicionar log de auditoria no frontend (analytics)
- [ ] Métricas: tempo de resposta, taxa de sucesso/erro

## ✨ Status Final

**PROBLEMA 1: ✅ RESOLVIDO**

- Frontend conectado ao backend
- Solicitações sendo criadas corretamente
- Validações funcionando (backend)
- Estado da UI reflete solicitações pendentes
- Mensagens de erro do backend exibidas corretamente
- Botão desabilitado após envio bem-sucedido
