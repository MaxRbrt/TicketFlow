<div align="center">

# 🎫 TicketFlow

### Sistema de Gerenciamento de Chamados de Suporte

Aplicação web para abrir, acompanhar e resolver chamados de suporte, com dois perfis de acesso (**solicitante** e **suporte**), autenticação e dados em tempo real.

[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Pinia](https://img.shields.io/badge/Pinia-state-FFD859?logo=vuedotjs&logoColor=black)](https://pinia.vuejs.org/)

🔗 **Demo:** https://projetoticketflow-c3b5c.web.app

</div>

---

## 📖 Sobre

O **TicketFlow** centraliza a comunicação entre quem precisa de suporte e a equipe que resolve os chamados. Em vez de problemas dispersos em conversas informais, e-mails perdidos ou mensagens sem controle, tudo passa por um fluxo único e rastreável:

> **problema relatado → chamado aberto → suporte acompanha → status atualizado → solução registrada → chamado finalizado**

Projeto desenvolvido com **Vue 3 (Composition API)** e **Firebase**, atendendo a um escopo acadêmico: autenticação por e-mail/senha, rotas protegidas por perfil, persistência no Cloud Firestore e CRUD completo.

---

## ✨ Funcionalidades

### 👤 Solicitante
- Cadastro, login e logout
- Abrir chamados (título, descrição, categoria, prioridade, local)
- Listar **apenas os próprios** chamados, com filtros (status/prioridade/categoria) e busca
- Ver detalhes em tempo real (resposta e solução do suporte)
- Editar e excluir chamados **enquanto abertos**; cancelar chamado
- Sino de notificações: avisa quando o suporte atualiza um chamado seu

### 🛠️ Suporte
- Visualizar **todos** os chamados, com filtros, busca e destaque para urgentes
- Painel com indicadores (abertos / em andamento / urgentes / resolvidos)
- Assumir chamado (vira responsável → "em andamento")
- Atualizar status, responder ao solicitante e registrar a solução aplicada
- Finalizar atendimento (exige resposta **e** solução)
- Cancelar ou excluir chamados (com confirmação)
- Sino de notificações: avisa chamados novos aguardando atendimento

### 🔒 Controle de acesso
- Rotas internas bloqueadas para quem não está autenticado
- Cada perfil acessa somente a sua área (guards no Vue Router)
- Reforço no servidor via **Firestore Security Rules**

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Front-end | Vue 3 (Composition API) + Vite |
| Estado global | Pinia |
| Rotas | Vue Router (com guards de auth/perfil) |
| Backend (BaaS) | Firebase Authentication + Cloud Firestore |
| Ícones | @lucide/vue |
| Hosting | Firebase Hosting |
| Functions (opcional) | Cloud Functions — auditoria e claims (plano Blaze, fora do deploy free) |

---

## 📁 Estrutura

```txt
TicketFlow/
├── frontend/                 # Aplicação Vue 3 + Vite
│   └── src/
│       ├── componentes/      # comuns, layout, chamados, painel
│       ├── composables/      # useAutenticacao, useChamados, useNotificacao*
│       ├── constantes/       # status, prioridades, categorias, perfis
│       ├── estilos/          # design system modular (tema escuro "Twilight")
│       ├── firebase/         # configuracaoFirebase.js
│       ├── paginas/          # publicas, solicitante, suporte, compartilhadas
│       ├── rotas/            # tabela de rotas + guards
│       ├── servicos/         # camada de acesso ao Firebase
│       ├── stores/           # Pinia (auth, chamados)
│       └── utils/            # formatação, ordenação, validação
│
├── backend/
│   ├── firebase/
│   │   ├── regras/firestore.rules        # segurança por perfil/dono
│   │   └── indices/firestore.indexes.json
│   ├── funcoes/              # Cloud Functions (opcional, Blaze)
│   └── scripts/              # dados de teste
│
├── firebase.json             # deploy (Firestore + Hosting)
└── .firebaserc
```

> A comunicação com o Firebase fica isolada em `servicos/`; as telas usam `composables/` e `stores/`. Nada de chamada direta ao Firebase espalhada pelos componentes.

---

## 🗃️ Modelo de dados (Firestore)

**`users/{uid}`**
```txt
uid, name, email, role: "requester" | "support",
department, active, createdAt, updatedAt
```

**`tickets/{ticketId}`**
```txt
id, title, description, category,
priority: "low" | "medium" | "high" | "urgent",
status:   "open" | "in_progress" | "waiting_requester" | "resolved" | "cancelled",
location, requesterId, requesterName, requesterEmail,
assignedToId, assignedToName, supportResponse, resolution,
createdAt, updatedAt, resolvedAt, cancelledAt
```

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Projeto Firebase com **Authentication (E-mail/Senha)** e **Cloud Firestore (Native mode)** ativados

### Front-end
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### Configuração do Firebase
As credenciais Web ficam em `frontend/src/firebase/configuracaoFirebase.js`. As chaves do SDK Web do Firebase são públicas por design (vão embutidas no bundle do cliente) — a segurança real é garantida pelas **Firestore Rules** e pelo **Authentication**, não pelo segredo da chave. Para usar seu próprio projeto, basta substituir o objeto `firebaseConfig`.

### Deploy
```bash
# Build do front
cd frontend && npm run build && cd ..

# Regras + índices do Firestore
firebase deploy --only firestore

# Hosting
firebase deploy --only hosting
```

---

## 🔐 Segurança

A proteção atua em **duas camadas**:
1. **Front-end** — guards de rota (auth + perfil) e exibição de ações conforme o papel.
2. **Firestore Rules** — usuário lê só o próprio doc em `users`; solicitante cria/lê/edita/exclui apenas chamados próprios e abertos; suporte lê todos e atualiza status/resposta/solução/responsável.

> Persistência de sessão **por aba** (`sessionStorage`): permite logar suporte numa aba e solicitante em outra, no mesmo navegador.

---

## 📜 Scripts úteis

```bash
npm run dev        # servidor de desenvolvimento (frontend)
npm run build      # build de produção
npm run preview    # pré-visualiza o build
firebase use       # mostra o projeto Firebase ativo
```

---

## 🗺️ Melhorias futuras

- Histórico completo de alterações por chamado
- Comentários entre solicitante e suporte
- Anexos, recuperação de senha, relatórios e gráficos
- Avaliação do atendimento e busca por palavra-chave

---

## 👤 Autor

**Marcos Roberto** — [@MaxRbrt](https://github.com/MaxRbrt)

Projeto acadêmico — TicketFlow.
