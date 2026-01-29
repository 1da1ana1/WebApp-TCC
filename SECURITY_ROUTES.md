# 🔐 Proteção de Rotas por Role - Documentação

## O que foi implementado?

Um sistema de **barreiras de segurança** que impede usuários não autorizados de acessar páginas que exigem um papel específico (role).

## 📋 Estrutura

### 1. **Router Guard** (`src/router/index.js`)

O `router.beforeEach` verifica antes de cada navegação:

```javascript
// 1. É rota pública? ✅ Deixa passar
// 2. Usuário autenticado? ❌ Redireciona para /login
// 3. Role do usuário = role requerido? ✅ Deixa passar
// 4. Role diferente? ❌ Redireciona para /acesso-negado
```

### 2. **Meta Properties**

Cada rota protegida tem:

```javascript
meta: {
  requiresAuth: true,
  requiredRole: 'teacher' // ou 'coordinator' ou 'student'
}
```

### 3. **Página de Acesso Negado** (`src/views/AccessDeniedView.vue`)

Uma página elegante que mostra:
- ❌ Ícone de bloqueio
- 📝 Mensagem explicativa
- 👤 Informações do usuário atual
- 🔗 Botões para voltar ao início ou fazer login novamente

---

## 🧪 Como Testar

### Teste 1: Aluno tentando acessar Dashboard do Coordenador

1. Faça login como **Aluno** (`aluno@unicamp.br` / `123456`)
2. Digite na URL: `http://localhost:5173/painel/coordenador`
3. **Resultado esperado**: Página com "Acesso Negado" aparece ✅

### Teste 2: Aluno tentando acessar Dashboard do Professor

1. Faça login como **Aluno** (`aluno@unicamp.br` / `123456`)
2. Digite na URL: `http://localhost:5173/perfil/docente`
3. **Resultado esperado**: Página com "Acesso Negado" aparece ✅

### Teste 3: Professor acessando seu próprio Dashboard

1. Faça login como **Professor** (`prof@unicamp.br` / `123456`)
2. Digite na URL: `http://localhost:5173/perfil/docente`
3. **Resultado esperado**: Dashboard do Professor carrega normalmente ✅

### Teste 4: Coordenador acessando Dashboard do Coordenador

1. Faça login como **Coordenador** (`coord@unicamp.br` / `123456`)
2. Digite na URL: `http://localhost:5173/painel/coordenador`
3. **Resultado esperado**: Dashboard do Coordenador carrega normalmente ✅

### Teste 5: Usuário não autenticado tentando acessar rota protegida

1. Faça logout (ou abra em nova aba sem autenticação)
2. Digite na URL: `http://localhost:5173/perfil/docente`
3. **Resultado esperado**: Redireciona para `/login` ✅

### Teste 6: Console Audit Log

1. Abra o **Console do Navegador** (F12)
2. Faça um aluno tentar acessar `/painel/coordenador`
3. **Resultado esperado**: Mensagem de warning aparece:
   ```
   ❌ Acesso Negado: Usuário com role 'student' tentou acessar rota que requer 'coordinator'
   Rota: /painel/coordenador
   ```

---

## 🛡️ Rotas Protegidas

| Rota | Role Requerido | Descrição |
|------|---|---|
| `/perfil/docente` | `teacher` | Dashboard do Professor |
| `/painel/coordenador` | `coordinator` | Dashboard do Coordenador |
| `/coordenador/buscar-usuario` | `coordinator` | Busca de Usuários (Coord) |
| `/coordenador/usuario/:id` | `coordinator` | Detalhes de Usuário (Coord) |

---

## 📧 Credenciais para Teste

```
Aluno:
Email: aluno@unicamp.br
Senha: 123456

Professor:
Email: prof@unicamp.br
Senha: 123456

Coordenador:
Email: coord@unicamp.br
Senha: 123456
```

---

## 🔍 Como Adicionar Novas Rotas Protegidas

1. Adicione `meta` na rota:

```javascript
{
  path: '/minha-rota',
  name: 'MinhaRota',
  component: () => import('@/views/MinhaView.vue'),
  meta: {
    requiresAuth: true,
    requiredRole: 'student' // ou 'teacher' ou 'coordinator'
  }
}
```

2. Pronto! O `router.beforeEach` automaticamente protegerá!

---

## ⚙️ Personalização

### Adicionar mais roles

No `src/stores/auth.js`, adicione novos tipos de usuário:

```javascript
if (email === 'novo@email.com' && password === 'senha') {
  mockUser = {
    type: 'novo_role', // Novo papel
    // ... resto do objeto
  }
}
```

Depois use na rota:

```javascript
meta: { requiredRole: 'novo_role' }
```

### Alterar URL de acesso negado

No `router.beforeEach`, mude:

```javascript
next('/acesso-negado') // Para outra página
next('/home') // Por exemplo
```

---

## 📊 Fluxo de Segurança

```
Usuário tenta acessar rota
        ↓
┌─────────────────────────────────────┐
│ É rota pública? (/login, /, etc)   │
└─────────────────────────────────────┘
        ↓ Sim              ↓ Não
    ✅ Passa         Está autenticado?
                    ↓ Sim         ↓ Não
                Tem role certo?  → ❌ /login
                ↓ Sim    ↓ Não
              ✅ Passa  → ❌ /acesso-negado
```

---

## 🚀 Próximos Passos

- [ ] Integrar com backend API real em vez de mock
- [ ] Implementar refresh token automático
- [ ] Adicionar logs de segurança no servidor
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Rate limiting em tentativas de login

