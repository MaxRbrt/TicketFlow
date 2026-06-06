# TicketFlow

Sistema web para gerenciamento de chamados de suporte, desenvolvido com Vue 3,
Vite, Pinia e Firebase.

Demo: https://projetoticketflow-c3b5c.web.app

## Sobre o projeto

O TicketFlow centraliza a abertura, acompanhamento e resolucao de chamados entre
solicitantes e equipe de suporte. O sistema possui autenticacao, controle de
acesso por perfil, dados em tempo real no Cloud Firestore, chat por chamado,
relatorios operacionais e uma base de conhecimento para autoatendimento.

Fluxo principal:

```txt
solicitante entra em uma sessao de suporte
-> abre um chamado
-> suporte acompanha e conversa pelo chat
-> status e resposta sao atualizados
-> solucao e finalizacao ficam registradas
```

## Funcionalidades

### Solicitante

- Cadastro, login, logout e recuperacao de senha.
- Entrada em uma sessao de atendimento por codigo informado pelo suporte.
- Abertura de chamados com titulo, descricao, categoria, prioridade e local.
- Listagem dos proprios chamados com filtros e busca.
- Edicao, cancelamento e exclusao de chamados enquanto ainda estao abertos.
- Tela de detalhes com resposta, solucao, historico e chat em tempo real.
- Notificacoes quando o suporte atualiza chamados.
- Consulta da Base de Conhecimento antes ou depois de abrir chamados.

### Suporte

- Painel com indicadores de chamados, urgencia e resumo operacional.
- Criacao e controle da propria sessao de atendimento.
- Visualizacao dos chamados vinculados as suas sessoes.
- Filtros, busca e destaque para chamados urgentes.
- Assumir chamados, atualizar status, responder e registrar solucao.
- Chat em tempo real com o solicitante.
- Relatorios com volume por periodo, setor/local, tempo medio de resolucao,
  taxa de resolucao, backlog e ranking de solicitantes.
- Base de Conhecimento com criacao, leitura, edicao e exclusao de artigos
  publicados pelo proprio suporte.

### Controle de acesso

- Rotas protegidas por autenticacao.
- Areas separadas para solicitante e suporte.
- Solicitante precisa estar vinculado a uma sessao antes de usar a area de
  chamados.
- Regras do Firestore reforcam as permissoes no servidor.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | Vue 3 + Vite |
| Estado global | Pinia |
| Rotas | Vue Router |
| Backend | Firebase Authentication + Cloud Firestore |
| Graficos | Chart.js + vue-chartjs |
| Icones | @lucide/vue |
| Hospedagem | Firebase Hosting |

## Estrutura

```txt
TicketFlow/
|-- backend/
|   |-- firebase/
|   |   |-- regras/firestore.rules
|   |   `-- indices/firestore.indexes.json
|   |-- funcoes/
|   `-- scripts/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- componentes/
|       |   |-- baseconhecimento/
|       |   |-- chamados/
|       |   |-- comuns/
|       |   |-- layout/
|       |   |-- painel/
|       |   `-- relatorios/
|       |-- composables/
|       |-- constantes/
|       |-- estilos/
|       |-- firebase/
|       |-- paginas/
|       |-- rotas/
|       |-- servicos/
|       |-- stores/
|       `-- utils/
|-- firebase.json
|-- .firebaserc
`-- README.md
```

## Modelo de dados

Principais colecoes do Cloud Firestore:

```txt
users/{uid}
```

Perfil do usuario autenticado.

Campos principais: `uid`, `name`, `email`, `role`, `department`, `active`,
`createdAt`, `updatedAt`.

```txt
sessoes/{codigo}
```

Sessao criada pelo suporte para vincular solicitantes aos atendimentos.

Campos principais: `codigo`, `suporteId`, `suporteNome`, `ativo`, `criadoEm`.

```txt
tickets/{ticketId}
```

Chamado aberto por um solicitante e vinculado a uma sessao de suporte.

Campos principais: `title`, `description`, `category`, `priority`, `status`,
`location`, `requesterId`, `sessionId`, `sessionSupportId`, `assignedToId`,
`supportResponse`, `resolution`, `createdAt`, `updatedAt`.

Subcolecoes:

- `tickets/{ticketId}/mensagens`: mensagens imutaveis do chat.
- `tickets/{ticketId}/historico`: eventos de auditoria do chamado.

```txt
articles/{articleId}
```

Artigos da Base de Conhecimento.

Campos principais: `title`, `body`, `category`, `authorId`, `authorName`,
`createdAt`, `updatedAt`.

## Seguranca

A seguranca foi implementada em duas camadas:

1. Front-end: guards de rota validam usuario logado, perfil e sessao ativa.
2. Firestore Rules: impedem acesso fora do escopo permitido para cada perfil.

Regras principais:

- Solicitante acessa apenas seus dados e seus chamados.
- Suporte acessa apenas chamados vinculados as suas sessoes.
- Mensagens de chat sao imutaveis depois de criadas.
- Artigos podem ser lidos por usuarios autenticados.
- Apenas suporte cria artigos.
- Apenas o autor do artigo pode editar ou excluir.
- Operacoes nao previstas sao bloqueadas por padrao.

A configuracao Web do Firebase fica em
`frontend/src/firebase/configuracaoFirebase.js`. Em aplicacoes Web Firebase, a
`apiKey` do SDK cliente nao e tratada como segredo; a protecao real depende das
regras do Firestore, Authentication e restricoes configuradas no Google Cloud.

## Como rodar localmente

Pre-requisitos:

- Node.js 18 ou superior.
- Projeto Firebase com Authentication por e-mail/senha ativado.
- Cloud Firestore criado em modo Native.

Instalacao e execucao:

```bash
cd frontend
npm install
npm run dev
```

Aplicacao local:

```txt
http://localhost:5173
```

## Scripts

Execute os comandos a partir da pasta `frontend/`:

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de producao
npm run preview   # preview local do build
npm run test:run  # testes unitarios
```

## Deploy

Na raiz do projeto:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only firestore
firebase deploy --only hosting
```

O arquivo `firebase.json` esta configurado para publicar o Hosting a partir de
`frontend/dist` e manter o deploy de Firestore separado.

## Status da entrega

- Autenticacao com e-mail e senha.
- Controle de perfil solicitante/suporte.
- CRUD de chamados.
- Chat por chamado.
- Notificacoes por perfil.
- Base de Conhecimento.
- Relatorios do suporte.
- Firestore Rules e indices configurados.
- Deploy no Firebase Hosting.

## Autor

Marcos Roberto - [@MaxRbrt](https://github.com/MaxRbrt)

Projeto academico - TicketFlow.
