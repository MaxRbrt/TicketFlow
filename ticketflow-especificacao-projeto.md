# TicketFlow — Especificação do Projeto Final

## 1. Visão geral

O **TicketFlow** é uma aplicação web desenvolvida com **Vue.js** e integrada ao **Firebase**, criada para gerenciar chamados de suporte em uma instituição, empresa, faculdade, laboratório, setor administrativo ou equipe técnica.

A proposta principal é permitir que usuários comuniquem problemas, solicitações ou incidentes, enquanto uma equipe de suporte acompanha, responde, atualiza o status e finaliza os atendimentos.

O sistema possui **dois perfis principais de acesso**:

1. **Solicitante**: usuário que relata um problema ou abre uma solicitação.
2. **Suporte**: usuário responsável por visualizar, atender e resolver os chamados.

A aplicação deve ter autenticação por e-mail e senha, páginas protegidas, persistência de dados no Cloud Firestore e operações completas de CRUD: criar, consultar, atualizar e excluir dados.

---

## 2. Alinhamento com os requisitos do professor

### 2.1 Requisitos obrigatórios do projeto acadêmico

O projeto deve atender aos seguintes pontos:

- Utilizar **Vue.js** no front-end.
- Utilizar componentes e organização adequada do projeto.
- Ter interface amigável e responsiva.
- Integrar com **Firebase**.
- Implementar autenticação de usuários por **e-mail e senha**.
- Permitir cadastro de usuário.
- Permitir login.
- Permitir logout.
- Implementar controle de acesso às páginas protegidas.
- Utilizar **Cloud Firestore** para armazenar os dados.
- Permitir inserir dados.
- Permitir consultar dados.
- Permitir atualizar dados.
- Permitir excluir dados.
- Apresentar uma proposta diferente do projeto feito em sala de aula.

### 2.2 Como o TicketFlow atende a esses requisitos

| Requisito | Como será atendido no TicketFlow |
|---|---|
| Vue.js | A aplicação será construída com Vue.js, preferencialmente Vue 3 com Vite. |
| Componentização | Serão criados componentes reutilizáveis para layout, formulários, cards, tabelas, filtros e badges. |
| Interface responsiva | O sistema deverá funcionar bem em desktop, tablet e celular. |
| Firebase Authentication | Login, cadastro e logout serão feitos com e-mail e senha. |
| Controle de acesso | Usuários não autenticados não acessam páginas internas. Solicitantes e suporte terão áreas diferentes. |
| Firestore | Chamados, usuários e dados operacionais serão salvos no Cloud Firestore. |
| Inserir dados | O solicitante cria chamados; usuários são cadastrados. |
| Consultar dados | Solicitantes consultam seus chamados; suporte consulta os chamados vinculados às suas sessões de atendimento. |
| Atualizar dados | O solicitante pode editar chamados abertos; o suporte atualiza status, conversa no chat, registra resposta e solução. |
| Excluir dados | O solicitante pode excluir chamados abertos; o suporte pode excluir ou arquivar chamados conforme regra definida. |
| Criatividade | A proposta simula um sistema real de atendimento e suporte, com dois perfis e fluxo de resolução. |

---

## 3. Objetivo da aplicação

O objetivo do TicketFlow é organizar a comunicação entre pessoas que precisam de suporte e a equipe responsável por resolver essas solicitações.

Em vez de problemas serem enviados por WhatsApp, conversas informais, e-mail perdido ou mensagens sem controle, o sistema centraliza tudo em um painel único.

O solicitante pode abrir um chamado informando o problema, acompanhar o andamento, conversar com o suporte e visualizar a resposta. Já a equipe de suporte pode visualizar os chamados vinculados às suas sessões de atendimento, filtrar por prioridade ou status, assumir atendimentos, conversar, responder e finalizar chamados.

---

## 4. Problema que o sistema resolve

Em muitos ambientes, problemas técnicos e solicitações internas são tratados de forma desorganizada. Alguns exemplos:

- Uma impressora apresenta erro, mas ninguém sabe quem avisou.
- Um usuário perde acesso a um sistema e a solicitação fica esquecida.
- A internet de uma sala cai e várias pessoas reclamam por canais diferentes.
- A equipe de suporte não sabe quais problemas são urgentes.
- O solicitante não sabe se alguém está resolvendo o problema.
- Não existe histórico do que foi resolvido, quando foi resolvido e por quem foi resolvido.

O TicketFlow resolve isso criando um fluxo claro:

**problema relatado → chamado aberto → suporte acompanha → status atualizado → solução registrada → chamado finalizado**.

---

## 5. Nome do projeto

Nome recomendado:

# TicketFlow — Sistema de Gerenciamento de Chamados

Outras opções possíveis:

- SuporteJá
- ResolveDesk
- DeskFlow
- ChamadoFácil
- HelpDesk Web
- Atende+ 

A recomendação é usar **TicketFlow**, pois passa uma imagem mais profissional e combina com a ideia de fluxo de atendimento.

---

## 6. Perfis de usuário

## 6.1 Solicitante

O solicitante é o usuário que abre chamados. Ele pode ser um funcionário, aluno, cliente, morador, colaborador ou qualquer pessoa que precise solicitar atendimento.

### Responsabilidades do solicitante

- Criar uma conta.
- Fazer login.
- Abrir chamados.
- Descrever problemas ou solicitações.
- Informar categoria, prioridade e local/setor.
- Acompanhar o andamento dos próprios chamados.
- Visualizar respostas do suporte.
- Editar chamados enquanto ainda estiverem abertos.
- Excluir ou cancelar chamados abertos.
- Fazer logout.

### Restrições do solicitante

- Não pode visualizar chamados de outros usuários.
- Não pode alterar o técnico responsável.
- Não pode marcar um chamado como resolvido diretamente.
- Não pode editar resposta técnica do suporte.
- Não pode acessar o painel da equipe de suporte.

---

## 6.2 Suporte

O suporte é o usuário responsável por atender os chamados. Pode representar uma equipe de TI, manutenção, atendimento interno, secretaria, laboratório, setor técnico ou equipe administrativa.

### Responsabilidades do suporte

- Fazer login.
- Visualizar os chamados vinculados às próprias sessões de atendimento.
- Filtrar chamados por status, prioridade ou categoria.
- Acessar detalhes de cada chamado.
- Assumir um chamado.
- Alterar status do chamado.
- Conversar com o solicitante pelo chat do chamado.
- Registrar resposta ao solicitante.
- Registrar solução aplicada.
- Finalizar chamados.
- Excluir ou arquivar chamados, caso necessário.
- Fazer logout.

### Restrições do suporte

- Não deve alterar dados pessoais de outros usuários sem necessidade.
- Não deve modificar o autor original do chamado.
- Não deve remover histórico importante de atendimento sem justificativa.

---

## 7. Fluxo principal da aplicação

## 7.1 Fluxo do solicitante

1. O usuário acessa a aplicação.
2. Caso não tenha conta, realiza cadastro.
3. Caso já tenha conta, realiza login.
4. O sistema identifica que o perfil é **solicitante**.
5. Se ainda não estiver vinculado, o usuário informa o código de atendimento gerado pelo suporte.
6. O usuário é redirecionado para o painel **Meus Chamados**.
7. O usuário cria um novo chamado.
8. O chamado é salvo no Firestore com status inicial **Aberto** e vinculado ao suporte da sessão.
9. O usuário acompanha o status do chamado e conversa pelo chat.
10. O suporte responde, envia mensagem ou altera o status.
11. O usuário recebe notificação e visualiza a resposta e a solução.

---

## 7.2 Fluxo do suporte

1. O usuário acessa a aplicação.
2. Realiza login com e-mail e senha.
3. O sistema identifica que o perfil é **suporte**.
4. O usuário é redirecionado para o painel **Atendimento**.
5. O suporte gera ou reutiliza um código de atendimento.
6. Solicitantes entram com esse código e os chamados passam a ficar vinculados ao suporte.
7. O suporte visualiza os chamados das próprias sessões.
8. O suporte escolhe um chamado aberto.
9. O suporte assume o chamado.
10. O status muda para **Em andamento**.
11. O suporte conversa, adiciona uma resposta ou observação.
12. O suporte registra a solução aplicada.
13. O chamado é finalizado como **Resolvido**.

---

## 8. Status dos chamados

Os chamados devem seguir um fluxo de status simples e compreensível.

### 8.1 Status sugeridos

| Status | Significado |
|---|---|
| Aberto | Chamado criado pelo solicitante e ainda não iniciado pelo suporte. |
| Em andamento | O suporte já começou a analisar ou resolver o chamado. |
| Aguardando solicitante | O suporte precisa de mais informações do usuário. |
| Resolvido | O problema foi solucionado e o atendimento foi finalizado. |
| Cancelado | O chamado foi cancelado pelo solicitante ou pelo suporte. |

### 8.2 Fluxo recomendado de status

- Todo chamado novo começa como **Aberto**.
- O suporte pode mudar de **Aberto** para **Em andamento**.
- O suporte pode mudar de **Em andamento** para **Aguardando solicitante**.
- O suporte pode mudar de **Aguardando solicitante** para **Em andamento**.
- O suporte pode mudar de **Em andamento** para **Resolvido**.
- O solicitante pode cancelar um chamado enquanto ele estiver **Aberto**.
- Chamados resolvidos não devem ser editados pelo solicitante.

---

## 9. Categorias de chamados

As categorias ajudam a organizar os tipos de problemas recebidos.

Categorias sugeridas:

- Hardware
- Software
- Internet/Rede
- Impressora
- Acesso a sistemas
- Manutenção
- Instalação
- Solicitação administrativa
- Outros

Essas categorias podem ser fixas no front-end em um arquivo de constantes ou cadastradas no Firestore em uma versão mais avançada.

Para o projeto acadêmico, recomenda-se usar categorias fixas para reduzir complexidade.

---

## 10. Níveis de prioridade

Os chamados devem ter prioridade para indicar urgência.

Prioridades sugeridas:

| Prioridade | Uso esperado |
|---|---|
| Baixa | Solicitações simples ou sem urgência. |
| Média | Problemas importantes, mas que não impedem totalmente o trabalho. |
| Alta | Problemas que prejudicam atividades relevantes. |
| Urgente | Problemas críticos que impedem o usuário ou setor de trabalhar. |

Visualmente, cada prioridade pode ter uma cor diferente na interface.

---

## 11. Requisitos funcionais

## 11.1 Autenticação e usuários

### RF001 — Cadastro de usuário

O sistema deve permitir que novos usuários criem uma conta usando nome, e-mail, senha e tipo de perfil.

Campos mínimos:

- Nome completo
- E-mail
- Senha
- Confirmação de senha
- Tipo de conta: Solicitante ou Suporte

Observação: para o projeto acadêmico, o tipo de conta pode ser escolhido no cadastro. Em um sistema real, o ideal seria que apenas um administrador pudesse conceder perfil de suporte.

---

### RF002 — Login de usuário

O sistema deve permitir que usuários cadastrados façam login usando e-mail e senha.

Após o login:

- Solicitantes devem ser redirecionados para o painel de solicitante.
- Usuários de suporte devem ser redirecionados para o painel de suporte.

---

### RF003 — Logout

O sistema deve permitir que usuários autenticados encerrem a sessão.

Após o logout:

- O usuário deve ser redirecionado para a tela de login.
- As páginas internas não devem continuar acessíveis sem autenticação.

---

### RF004 — Controle de acesso por autenticação

O sistema deve impedir que usuários não autenticados acessem rotas internas.

Exemplos de rotas protegidas:

- Dashboard do solicitante
- Dashboard do suporte
- Listagem de chamados
- Detalhes do chamado
- Perfil do usuário

---

### RF005 — Controle de acesso por perfil

O sistema deve validar o tipo de usuário antes de liberar determinada área.

Regras:

- Usuários com perfil **solicitante** acessam apenas telas de solicitante.
- Usuários com perfil **suporte** acessam telas de suporte.
- Rotas de suporte não devem ser acessadas por solicitantes.
- Rotas de solicitante podem ser bloqueadas para suporte, se desejado, ou compartilhadas parcialmente.

---

## 11.2 Chamados do solicitante

### RF006 — Criar chamado

O solicitante deve conseguir abrir um novo chamado.

Campos mínimos do chamado:

- Título
- Descrição
- Categoria
- Prioridade
- Setor ou local
- Status inicial
- Data de criação
- ID do solicitante
- Nome do solicitante
- E-mail do solicitante

O status inicial de todo chamado deve ser **Aberto**.

---

### RF007 — Listar meus chamados

O solicitante deve conseguir visualizar apenas os chamados criados por ele.

A listagem deve exibir informações resumidas:

- Título
- Categoria
- Prioridade
- Status
- Data de abertura
- Última atualização

---

### RF008 — Filtrar meus chamados

O solicitante deve conseguir filtrar seus chamados por:

- Status
- Prioridade
- Categoria

Filtros recomendados para a primeira versão:

- Todos
- Abertos
- Em andamento
- Resolvidos
- Cancelados

---

### RF009 — Visualizar detalhes do chamado

O solicitante deve conseguir acessar uma tela de detalhes do chamado.

A tela deve mostrar:

- Título
- Descrição
- Categoria
- Prioridade
- Status
- Setor/local
- Data de criação
- Data de atualização
- Técnico responsável, se houver
- Resposta do suporte
- Solução aplicada

---

### RF010 — Editar chamado aberto

O solicitante deve conseguir editar um chamado apenas enquanto ele estiver com status **Aberto**.

Campos editáveis:

- Título
- Descrição
- Categoria
- Prioridade
- Setor/local

Depois que o chamado estiver em andamento ou resolvido, o solicitante não deve alterar os dados principais.

---

### RF011 — Excluir chamado aberto

O solicitante deve conseguir excluir um chamado criado por ele, desde que ainda esteja com status **Aberto**.

Essa funcionalidade atende ao requisito de exclusão de dados no Firestore.

Alternativa aceitável: em vez de excluir fisicamente, o sistema pode cancelar o chamado. Porém, para cumprir claramente o requisito acadêmico de excluir dados, recomenda-se implementar exclusão real para chamados abertos.

---

## 11.3 Chamados do suporte

### RF012 — Listar chamados vinculados ao suporte

O usuário com perfil de suporte deve visualizar os chamados vinculados às suas sessões de atendimento.

A listagem deve exibir:

- Título
- Solicitante
- Categoria
- Prioridade
- Status
- Data de abertura
- Técnico responsável

---

### RF013 — Filtrar chamados no painel de suporte

O suporte deve conseguir filtrar chamados por:

- Status
- Prioridade
- Categoria
- Solicitante

Filtros importantes:

- Todos
- Abertos
- Em andamento
- Urgentes
- Resolvidos

---

### RF014 — Visualizar detalhes completos do chamado

O suporte deve conseguir abrir um chamado e visualizar todos os dados enviados pelo solicitante.

A tela deve mostrar:

- Dados do chamado
- Dados do solicitante
- Status atual
- Histórico básico de atualização
- Resposta do suporte
- Solução aplicada

---

### RF015 — Assumir chamado

O suporte deve conseguir assumir um chamado.

Ao assumir:

- O campo de técnico responsável deve receber o ID e nome do usuário de suporte.
- O status pode ser alterado automaticamente para **Em andamento**.
- A data de atualização deve ser modificada.

---

### RF016 — Atualizar status do chamado

O suporte deve conseguir alterar o status de um chamado.

Status permitidos:

- Aberto
- Em andamento
- Aguardando solicitante
- Resolvido
- Cancelado

Ao atualizar o status:

- A data de atualização deve ser alterada.
- Se o status for **Resolvido**, a data de conclusão deve ser preenchida.

---

### RF017 — Responder chamado

O suporte deve conseguir adicionar uma resposta visível ao solicitante.

Exemplo:

> Verificamos o problema informado. O acesso foi restaurado. Por favor, tente entrar novamente no sistema.

---

### RF018 — Registrar solução aplicada

O suporte deve conseguir registrar a solução aplicada.

Exemplo:

> Foi realizada a reinstalação do driver da impressora e o equipamento voltou a funcionar normalmente.

Essa informação é importante para criar histórico de atendimento.

---

### RF019 — Finalizar chamado

O suporte deve conseguir finalizar um chamado alterando o status para **Resolvido**.

Para finalizar, recomenda-se exigir:

- Resposta ao solicitante
- Solução aplicada

---

### RF020 — Excluir ou arquivar chamado

O suporte deve conseguir excluir um chamado quando necessário.

Para um projeto acadêmico, a exclusão pode ser direta no Firestore.

Em uma aplicação real, o ideal seria usar arquivamento ou exclusão lógica, por exemplo:

- `deleted: true`
- `archived: true`

Mas, como o requisito do professor pede excluir dados, a aplicação pode ter uma opção de exclusão real, preferencialmente com confirmação.

---

## 12. Requisitos não funcionais

### RNF001 — Responsividade

A aplicação deve funcionar adequadamente em diferentes tamanhos de tela:

- Desktop
- Notebook
- Tablet
- Celular

Em telas menores, tabelas podem ser substituídas por cards.

---

### RNF002 — Usabilidade

A interface deve ser simples, clara e objetiva.

O usuário deve conseguir entender rapidamente:

- Onde abrir um chamado.
- Onde acompanhar seus chamados.
- Qual o status atual.
- Quais ações estão disponíveis.

---

### RNF003 — Organização do código

O projeto deve ter uma estrutura de pastas clara, separando:

- Componentes reutilizáveis
- Páginas
- Serviços do Firebase
- Rotas
- Estados globais
- Constantes
- Utilitários
- Estilos

---

### RNF004 — Manutenibilidade

A aplicação deve ser organizada de forma que novas funcionalidades possam ser adicionadas sem reescrever grandes partes do sistema.

Exemplos de possíveis evoluções:

- Adicionar comentários no chamado.
- Adicionar anexos.
- Adicionar painel administrativo.
- Adicionar notificações.
- Adicionar relatórios.

---

### RNF005 — Segurança básica

A aplicação deve proteger rotas internas e restringir ações por perfil.

Regras mínimas:

- Usuário não logado não acessa páginas protegidas.
- Solicitante não acessa painel de suporte.
- Solicitante só consulta seus próprios chamados.
- Suporte acessa chamados de todos os usuários.

Além disso, as regras do Firestore devem reforçar essas permissões sempre que possível.

---

### RNF006 — Feedback visual

O sistema deve fornecer feedback visual para ações importantes:

- Carregando dados
- Salvando chamado
- Chamado criado com sucesso
- Erro ao criar chamado
- Status atualizado
- Confirmação antes de excluir
- Login inválido

---

### RNF007 — Performance

A aplicação deve buscar apenas os dados necessários.

Exemplos:

- Solicitante busca somente chamados do próprio usuário.
- Suporte busca chamados ordenados por data.
- Filtros devem evitar carregamento desnecessário sempre que possível.

---

### RNF008 — Acessibilidade básica

A interface deve seguir boas práticas básicas:

- Labels nos campos.
- Botões com texto claro.
- Contraste adequado.
- Mensagens de erro compreensíveis.
- Navegação simples.

---

### RNF009 — Padronização visual

O sistema deve usar um padrão visual consistente:

- Mesma tipografia.
- Mesmos espaçamentos.
- Mesmos estilos de botão.
- Mesmos estilos para cards.
- Cores padronizadas para status e prioridade.

---

### RNF010 — Tratamento de erros

A aplicação deve tratar erros comuns:

- E-mail já cadastrado.
- Senha inválida.
- Usuário não encontrado.
- Permissão negada.
- Falha ao carregar chamados.
- Falha ao salvar chamado.

---

## 13. Regras de negócio

### RN001 — Todo chamado deve ter um solicitante

Nenhum chamado pode existir sem estar relacionado a um usuário autenticado.

---

### RN002 — Todo chamado novo começa como aberto

Ao criar um chamado, o status inicial deve ser sempre **Aberto**.

---

### RN003 — Solicitante só visualiza seus chamados

Um usuário solicitante não pode visualizar chamados criados por outros usuários.

---

### RN004 — Suporte visualiza chamados das próprias sessões

Usuários com perfil de suporte podem consultar os chamados cujo `sessionSupportId` seja o UID do próprio suporte.

---

### RN005 — Solicitante só edita chamados abertos

O solicitante só pode editar um chamado enquanto o status for **Aberto**.

---

### RN006 — Chamado resolvido não deve ser editado pelo solicitante

Após a resolução, o chamado deve ficar apenas para consulta do solicitante.

---

### RN007 — Apenas suporte pode marcar como resolvido

O status **Resolvido** deve ser aplicado apenas por usuários de suporte.

---

### RN008 — Chamado urgente deve aparecer com destaque

Chamados com prioridade **Urgente** devem ter destaque visual no painel de suporte.

---

### RN009 — Exclusão deve exigir confirmação

Toda exclusão de chamado deve pedir confirmação antes de executar a ação.

---

### RN010 — Perfil do usuário define o redirecionamento

Após login:

- Solicitante vai para `/solicitante/painel`, ou para `/solicitante/sessao` se ainda não tiver código ativo.
- Suporte vai para `/suporte/painel`.

---

## 14. Estrutura de páginas e rotas

## 14.1 Rotas públicas

| Rota | Página | Descrição |
|---|---|---|
| `/` | Redirecionamento | Redireciona para login ou dashboard, dependendo da sessão. |
| `/login` | Login | Tela de autenticação. |
| `/cadastro` | Cadastro | Tela para criação de conta. |

---

## 14.2 Rotas protegidas compartilhadas

| Rota | Página | Acesso | Descrição |
|---|---|---|---|
| `/perfil` | Perfil do usuário | Solicitante e suporte | Mostra dados básicos da conta. |
| `/nao-autorizado` | Acesso negado | Solicitante e suporte | Exibida quando o perfil tenta acessar área indevida. |

---

## 14.3 Rotas do solicitante

| Rota | Página | Descrição |
|---|---|---|
| `/solicitante/sessao` | Conectar ao suporte | Entrada do código de atendimento gerado pelo suporte. |
| `/solicitante/painel` | Dashboard do solicitante | Resumo dos chamados do usuário. |
| `/solicitante/chamados` | Meus chamados | Lista de chamados criados pelo usuário. |
| `/solicitante/chamados/novo` | Novo chamado | Formulário para abrir chamado. |
| `/solicitante/chamados/:id/editar` | Editar chamado | Edição de chamado aberto. |
| `/solicitante/chamados/:id` | Detalhes do chamado | Detalhes, histórico e chat do chamado para o solicitante. |

---

## 14.4 Rotas do suporte

| Rota | Página | Descrição |
|---|---|---|
| `/suporte/painel` | Dashboard do suporte | Visão geral dos chamados das sessões do suporte. |
| `/suporte/chamados` | Todos os chamados | Lista dos chamados vinculados às sessões do suporte logado. |
| `/suporte/solicitantes` | Meus solicitantes | Agrupamento dos solicitantes que abriram chamados nas sessões do suporte. |
| `/suporte/chamados/:id` | Atendimento do chamado | Tela para assumir, responder e finalizar chamado. |

---

## 15. Descrição detalhada das telas

## 15.1 Tela de Login

### Objetivo

Permitir que usuários cadastrados acessem o sistema.

### Campos

- E-mail
- Senha

### Ações

- Entrar
- Ir para cadastro

### Validações

- E-mail obrigatório
- Senha obrigatória
- Mensagem para login inválido

### Comportamento esperado

Após login bem-sucedido, o sistema deve consultar o perfil do usuário no Firestore e redirecionar conforme o tipo de conta.

---

## 15.2 Tela de Cadastro

### Objetivo

Permitir a criação de usuários solicitantes ou suporte.

### Campos

- Nome completo
- E-mail
- Senha
- Confirmação de senha
- Tipo de conta

### Ações

- Criar conta
- Voltar para login

### Validações

- Nome obrigatório
- E-mail obrigatório e válido
- Senha obrigatória
- Senha com tamanho mínimo
- Confirmação de senha igual à senha
- Tipo de conta obrigatório

### Comportamento esperado

Após criar o usuário no Firebase Authentication, o sistema deve criar um documento na coleção `users` do Firestore com os dados complementares do perfil.

---

## 15.3 Dashboard do Solicitante

### Objetivo

Mostrar um resumo dos chamados do usuário logado.

### Informações exibidas

- Total de chamados
- Chamados abertos
- Chamados em andamento
- Chamados resolvidos
- Últimos chamados criados

### Ações

- Abrir novo chamado
- Ver todos os meus chamados
- Acessar detalhes de um chamado

### Visual recomendado

- Cards de resumo no topo.
- Lista ou cards dos últimos chamados abaixo.
- Botão destacado para criar novo chamado.

---

## 15.4 Página Meus Chamados

### Objetivo

Listar os chamados criados pelo solicitante.

### Informações exibidas

- Título
- Categoria
- Prioridade
- Status
- Data de criação
- Última atualização

### Ações

- Filtrar chamados
- Ver detalhes
- Editar chamado aberto
- Excluir chamado aberto

### Filtros recomendados

- Status
- Prioridade
- Categoria

---

## 15.5 Página Novo Chamado

### Objetivo

Permitir que o solicitante abra uma nova solicitação.

### Campos

- Título
- Descrição
- Categoria
- Prioridade
- Setor/local

### Ações

- Salvar chamado
- Cancelar

### Validações

- Título obrigatório
- Descrição obrigatória
- Categoria obrigatória
- Prioridade obrigatória
- Setor/local obrigatório ou opcional, conforme decisão do projeto

### Dados preenchidos automaticamente

- Status: Aberto
- ID do solicitante
- Nome do solicitante
- E-mail do solicitante
- Data de criação
- Data de atualização

---

## 15.6 Página Detalhes do Chamado para Solicitante

### Objetivo

Permitir que o solicitante acompanhe o andamento de um chamado específico.

### Informações exibidas

- Título
- Descrição
- Categoria
- Prioridade
- Status
- Setor/local
- Data de abertura
- Última atualização
- Técnico responsável
- Resposta do suporte
- Solução aplicada

### Ações disponíveis

Se o chamado estiver aberto:

- Editar
- Excluir
- Cancelar

Se o chamado estiver em andamento ou resolvido:

- Apenas visualizar

---

## 15.7 Dashboard do Suporte

### Objetivo

Dar à equipe de suporte uma visão geral dos chamados do sistema.

### Informações exibidas

- Total de chamados
- Chamados abertos
- Chamados em andamento
- Chamados urgentes
- Chamados resolvidos
- Chamados recentes

### Ações

- Ver chamados vinculados ao suporte
- Filtrar chamados urgentes
- Abrir detalhes de atendimento

### Visual recomendado

- Cards de indicadores.
- Tabela ou lista com chamados recentes.
- Destaque para chamados urgentes.

---

## 15.8 Página Todos os Chamados

### Objetivo

Permitir que o suporte consulte e organize os chamados vinculados às suas sessões de atendimento.

### Informações exibidas

- Título
- Solicitante
- Categoria
- Prioridade
- Status
- Técnico responsável
- Data de abertura

### Ações

- Filtrar
- Buscar
- Ordenar por data ou prioridade
- Abrir atendimento do chamado

### Filtros recomendados

- Status
- Prioridade
- Categoria
- Técnico responsável

---

## 15.9 Página Atendimento do Chamado

### Objetivo

Permitir que o suporte atenda, responda e finalize um chamado.

### Informações exibidas

- Dados do chamado
- Dados do solicitante
- Status atual
- Prioridade
- Categoria
- Local/setor
- Histórico básico

### Campos editáveis pelo suporte

- Status
- Técnico responsável
- Resposta ao solicitante
- Solução aplicada

### Ações

- Assumir chamado
- Salvar resposta
- Alterar status
- Finalizar como resolvido
- Cancelar chamado
- Excluir chamado, se permitido

---

## 15.10 Página Perfil

### Objetivo

Exibir dados básicos da conta do usuário autenticado.

### Informações exibidas

- Nome
- E-mail
- Tipo de conta
- Data de cadastro

### Ações

- Logout

Edição de perfil pode ser considerada extra, mas não é necessária para a primeira versão.

---

## 16. Modelo de dados no Firestore

## 16.1 Coleção `users`

Cada documento representa um usuário da aplicação.

O ID do documento deve ser o mesmo UID do Firebase Authentication.

### Campos atuais

```txt
users/{uid}
- uid: string
- name: string
- email: string
- role: "requester" | "support"
- department: string | null
- active: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

### Observações

- `role` define se o usuário é solicitante ou suporte.
- `active` pode ser usado futuramente para bloquear contas.
- `department` é opcional, mas pode deixar o sistema mais realista.

---

## 16.2 Coleção `tickets`

Cada documento representa um chamado.

### Campos atuais

```txt
tickets/{ticketId}
- id: string
- title: string
- description: string
- category: string
- priority: "low" | "medium" | "high" | "urgent"
- status: "open" | "in_progress" | "waiting_requester" | "resolved" | "cancelled"
- location: string
- requesterId: string
- requesterName: string
- requesterEmail: string
- sessionId: string
- sessionSupportId: string
- lastMessageAt: timestamp | null
- lastMessageBy: "requester" | "support" | null
- assignedToId: string | null
- assignedToName: string | null
- supportResponse: string | null
- resolution: string | null
- createdAt: timestamp
- updatedAt: timestamp
- resolvedAt: timestamp | null
- cancelledAt: timestamp | null
```

### Observações

- `requesterId` permite que cada solicitante consulte apenas seus próprios chamados.
- `sessionId` registra o código/sessão em que o chamado foi aberto.
- `sessionSupportId` define qual suporte tem permissão de leitura e atendimento.
- `lastMessageAt` e `lastMessageBy` alimentam as notificações de novas mensagens.
- `assignedToId` indica qual usuário de suporte assumiu o chamado.
- `supportResponse` é a resposta que o solicitante visualiza.
- `resolution` descreve a solução aplicada.

---

## 16.3 Coleção `sessoes`

Cada documento representa um código de atendimento criado por um usuário de suporte.

```txt
sessoes/{codigo}
- codigo: string
- suporteId: string
- suporteNome: string
- ativo: boolean
- criadoEm: timestamp
```

Observações:

- O ID do documento é o próprio código digitado pelo solicitante.
- A sessão ativa define o `sessionSupportId` gravado nos novos chamados.
- Encerrar uma sessão impede novas entradas com o código, mas não apaga chamados já vinculados.

---

## 16.4 Subcoleção `mensagens`

Cada chamado possui uma conversa em tempo real entre solicitante e suporte.

```txt
tickets/{ticketId}/mensagens/{mensagemId}
- autorId: string
- autorNome: string
- autorPapel: "requester" | "support"
- texto: string
- criadoEm: timestamp
```

Observações:

- Mensagens são imutáveis: criadas uma vez, sem edição ou exclusão.
- As regras validam se o autor faz parte do chamado.
- O documento do chamado é atualizado com `lastMessageAt` e `lastMessageBy` para notificações.

---

## 16.5 Subcoleção `historico`

Cada chamado registra eventos relevantes para auditoria.

```txt
tickets/{ticketId}/historico/{historicoId}
- acao: string
- statusAnterior: string | null
- statusNovo: string | null
- autorId: string
- autorNome: string
- criadoEm: timestamp
```

Observações:

- No plano Spark/free, o histórico é gravado pelo cliente.
- As regras permitem criação pelas partes do chamado e bloqueiam update/delete.

---

## 17. Operações CRUD principais

## 17.1 Create — Inserir dados

Exemplos:

- Criar usuário no cadastro.
- Criar documento do usuário na coleção `users`.
- Criar sessão de atendimento na coleção `sessoes`.
- Criar chamado na coleção `tickets`.
- Criar mensagem em `tickets/{ticketId}/mensagens`.
- Criar evento em `tickets/{ticketId}/historico`.

---

## 17.2 Read — Consultar dados

Exemplos:

- Buscar dados do usuário logado.
- Listar chamados do solicitante.
- Listar chamados vinculados às sessões do suporte.
- Visualizar detalhes de um chamado.
- Observar mensagens e histórico em tempo real.

---

## 17.3 Update — Atualizar dados

Exemplos:

- Editar dados de chamado aberto.
- Alterar status do chamado.
- Registrar técnico responsável.
- Adicionar resposta do suporte.
- Registrar solução aplicada.
- Atualizar marcadores de última mensagem (`lastMessageAt`, `lastMessageBy`).
- Encerrar/reabrir sessão de atendimento.

---

## 17.4 Delete — Excluir dados

Exemplos:

- Solicitante exclui chamado aberto.
- Suporte exclui chamado quando necessário.
- Usuário autenticado exclui a própria conta pelo fluxo de autoexclusão.

Recomendação: sempre exibir modal de confirmação antes de excluir.

---

## 18. Permissões e segurança conceitual

A segurança deve ser pensada em dois níveis:

1. **Front-end**: controle de rotas e exibição de ações conforme perfil.
2. **Firestore Rules**: regras de segurança para impedir acessos indevidos direto no banco.

### 18.1 Regras conceituais

- Apenas usuários autenticados podem acessar dados internos.
- Cada usuário pode ler seu próprio documento em `users`.
- Cada usuário pode atualizar nome/departamento do próprio perfil e excluir o próprio perfil no fluxo de autoexclusão.
- Solicitantes podem criar chamados vinculados ao próprio UID.
- Solicitantes podem ler apenas seus próprios chamados.
- Solicitantes podem editar/excluir apenas chamados próprios e abertos.
- Usuários de suporte podem ler chamados cujo `sessionSupportId` seja o próprio UID.
- Usuários de suporte podem atualizar status, resposta, solução e responsável.
- Apenas as partes de um chamado podem ler/criar mensagens.
- Apenas as partes de um chamado podem ler/criar eventos de histórico.
- Sessões de atendimento são criadas pelo suporte e lidas pelo solicitante ao informar o código.

---

## 19. Arquitetura recomendada do front-end

A aplicação deve ser organizada para ser fácil de manter.

Tecnologias recomendadas:

- Vue 3
- Vite
- Vue Router
- Firebase SDK
- Pinia, opcional, para estado global
- CSS puro, SCSS, Tailwind ou framework visual, conforme preferência

A recomendação é usar **Vue 3 com Composition API**, pois é uma abordagem atual e organizada.

---

## 20. Estrutura de pastas recomendada

Abaixo está uma estrutura profissional, clara e fácil de manter.

```txt
src/
├── assets/
│   ├── images/
│   └── icons/
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   │
│   ├── common/
│   │   ├── AppButton.vue
│   │   ├── AppInput.vue
│   │   ├── AppSelect.vue
│   │   ├── AppModal.vue
│   │   ├── AppLoading.vue
│   │   ├── EmptyState.vue
│   │   └── ConfirmDialog.vue
│   │
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   ├── AppLayout.vue
│   │   └── AuthLayout.vue
│   │
│   └── tickets/
│       ├── TicketCard.vue
│       ├── TicketTable.vue
│       ├── TicketForm.vue
│       ├── TicketFilters.vue
│       ├── TicketStatusBadge.vue
│       ├── TicketPriorityBadge.vue
│       └── TicketSummaryCards.vue
│
├── composables/
│   ├── useAuth.js
│   ├── useTickets.js
│   └── useUsers.js
│
├── constants/
│   ├── ticketCategories.js
│   ├── ticketPriorities.js
│   ├── ticketStatuses.js
│   └── userRoles.js
│
├── router/
│   └── index.js
│
├── services/
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js
│   │   └── firestore.js
│   │
│   ├── authService.js
│   ├── ticketService.js
│   └── userService.js
│
├── stores/
│   ├── authStore.js
│   └── ticketStore.js
│
├── styles/
│   ├── global.css
│   ├── variables.css
│   └── utilities.css
│
├── utils/
│   ├── dateFormatter.js
│   ├── errorHandler.js
│   └── validators.js
│
├── views/
│   ├── public/
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   │
│   ├── requester/
│   │   ├── RequesterDashboardView.vue
│   │   ├── MyTicketsView.vue
│   │   ├── NewTicketView.vue
│   │   └── EditTicketView.vue
│   │
│   ├── support/
│   │   ├── SupportDashboardView.vue
│   │   ├── AllTicketsView.vue
│   │   └── SupportTicketDetailsView.vue
│   │
│   └── shared/
│       ├── TicketDetailsView.vue
│       ├── ProfileView.vue
│       └── NotFoundView.vue
│
├── App.vue
└── main.js
```

---

## 21. Responsabilidade das principais pastas

## 21.1 `components/`

Contém componentes reutilizáveis.

Exemplos:

- Botões
- Inputs
- Modal de confirmação
- Cards de chamado
- Badges de status
- Layout principal

A regra é: se algo será usado em mais de uma tela, deve virar componente.

---

## 21.2 `views/`

Contém páginas completas da aplicação.

Exemplos:

- Login
- Cadastro
- Dashboard do solicitante
- Dashboard do suporte
- Lista de chamados
- Detalhes do chamado

As views devem montar a tela usando componentes menores.

---

## 21.3 `services/`

Contém a comunicação com Firebase.

Essa pasta evita que chamadas diretas ao Firebase fiquem espalhadas pelas telas.

Exemplos:

- Criar usuário
- Buscar perfil
- Criar chamado
- Atualizar chamado
- Excluir chamado

---

## 21.4 `composables/`

Contém regras reutilizáveis baseadas na Composition API.

Exemplos:

- `useAuth`: controla usuário logado, login, logout e perfil.
- `useTickets`: centraliza lógica de chamados.
- `useUsers`: centraliza lógica de usuários.

---

## 21.5 `stores/`

Contém estado global, caso seja utilizado Pinia.

Exemplos:

- Dados do usuário autenticado.
- Perfil do usuário.
- Estado de carregamento.

---

## 21.6 `constants/`

Contém valores fixos usados em várias partes do sistema.

Exemplos:

- Status de chamado
- Prioridades
- Categorias
- Perfis de usuário

Isso evita strings soltas espalhadas pelo projeto.

---

## 21.7 `utils/`

Contém funções auxiliares.

Exemplos:

- Formatador de data
- Tratador de erro
- Validações simples

---

## 22. Componentes recomendados

## 22.1 Componentes de layout

- `AuthLayout`: layout para login e cadastro.
- `AppLayout`: layout das telas internas.
- `AppHeader`: topo da aplicação.
- `AppSidebar`: menu lateral.

---

## 22.2 Componentes de formulário

- `AppInput`
- `AppSelect`
- `AppButton`
- `TicketForm`
- `LoginForm`
- `RegisterForm`

---

## 22.3 Componentes de chamados

- `TicketCard`: card para visualização responsiva.
- `TicketTable`: tabela para desktop.
- `TicketFilters`: filtros por status, prioridade e categoria.
- `TicketStatusBadge`: selo visual de status.
- `TicketPriorityBadge`: selo visual de prioridade.
- `TicketSummaryCards`: cards com totais do dashboard.

---

## 22.4 Componentes de feedback

- `AppLoading`
- `EmptyState`
- `ConfirmDialog`
- `AppModal`

---

## 23. Layout e navegação

## 23.1 Layout público

Usado em:

- Login
- Cadastro

Características:

- Tela centralizada.
- Formulário em card.
- Logo ou nome do sistema.
- Visual limpo.

---

## 23.2 Layout interno

Usado após login.

Características:

- Header com nome do sistema e usuário logado.
- Sidebar ou menu superior com navegação.
- Conteúdo principal.
- Botão de logout.

---

## 23.3 Menu do solicitante

Itens sugeridos:

- Dashboard
- Meus chamados
- Novo chamado
- Perfil
- Sair

---

## 23.4 Menu do suporte

Itens sugeridos:

- Dashboard
- Todos os chamados
- Chamados urgentes, opcional
- Perfil
- Sair

---

## 24. Design visual recomendado

## 24.1 Identidade visual

O TicketFlow deve transmitir organização, confiança e produtividade.

Sugestão de estilo:

- Fundo claro.
- Cards brancos.
- Bordas arredondadas.
- Sombras leves.
- Cores de status bem definidas.
- Botões objetivos.

---

## 24.2 Cores por status

Sugestão:

| Status | Cor visual sugerida |
|---|---|
| Aberto | Azul |
| Em andamento | Amarelo/Laranja |
| Aguardando solicitante | Roxo |
| Resolvido | Verde |
| Cancelado | Cinza/Vermelho |

---

## 24.3 Cores por prioridade

Sugestão:

| Prioridade | Cor visual sugerida |
|---|---|
| Baixa | Cinza ou verde claro |
| Média | Azul |
| Alta | Laranja |
| Urgente | Vermelho |

---

## 25. Validações importantes

## 25.1 Cadastro

- Nome não pode estar vazio.
- E-mail deve ter formato válido.
- Senha deve ter tamanho mínimo.
- Confirmação de senha deve ser igual à senha.
- Tipo de conta deve ser selecionado.

---

## 25.2 Login

- E-mail obrigatório.
- Senha obrigatória.
- Exibir mensagem em caso de erro.

---

## 25.3 Chamado

- Título obrigatório.
- Descrição obrigatória.
- Categoria obrigatória.
- Prioridade obrigatória.
- Não permitir salvar chamado vazio.

---

## 25.4 Atendimento pelo suporte

- Para resolver um chamado, deve haver uma solução aplicada.
- Para responder ao solicitante, a resposta não pode estar vazia.
- Ao assumir um chamado, o sistema deve salvar o usuário responsável.

---

## 26. Mensagens de feedback sugeridas

### Sucesso

- Conta criada com sucesso.
- Login realizado com sucesso.
- Chamado aberto com sucesso.
- Chamado atualizado com sucesso.
- Status atualizado com sucesso.
- Chamado excluído com sucesso.
- Atendimento finalizado com sucesso.

### Erro

- Não foi possível fazer login. Verifique seus dados.
- Este e-mail já está cadastrado.
- Não foi possível carregar os chamados.
- Não foi possível salvar o chamado.
- Você não tem permissão para acessar esta página.
- Ocorreu um erro inesperado. Tente novamente.

---

## 27. Estratégia de desenvolvimento sugerida

## 27.1 Etapa 1 — Base do projeto

- Criar projeto Vue com Vite.
- Instalar dependências necessárias.
- Criar estrutura de pastas.
- Configurar Firebase.
- Configurar Vue Router.
- Criar layout público e interno.

---

## 27.2 Etapa 2 — Autenticação

- Criar tela de cadastro.
- Criar tela de login.
- Implementar logout.
- Criar documento do usuário no Firestore.
- Buscar perfil do usuário após login.
- Redirecionar conforme perfil.

---

## 27.3 Etapa 3 — Rotas protegidas

- Criar proteção para usuários não logados.
- Criar proteção por perfil.
- Impedir solicitante de acessar suporte.
- Impedir suporte de acessar áreas indevidas, se necessário.

---

## 27.4 Etapa 4 — Chamados do solicitante

- Criar tela de novo chamado.
- Salvar chamado no Firestore.
- Listar chamados do usuário.
- Criar tela de detalhes.
- Permitir edição de chamados abertos.
- Permitir exclusão de chamados abertos.

---

## 27.5 Etapa 5 — Painel do suporte

- Listar chamados vinculados às sessões do suporte.
- Criar filtros.
- Criar tela de atendimento.
- Permitir assumir chamado.
- Permitir alterar status.
- Permitir responder chamado.
- Permitir registrar solução.
- Permitir finalizar chamado.

---

## 27.6 Etapa 6 — Refinamento visual

- Melhorar responsividade.
- Criar cards de resumo.
- Criar badges de status e prioridade.
- Criar estados vazios.
- Adicionar mensagens de feedback.
- Revisar organização do código.

---

## 28. Escopo mínimo viável

Para entregar dentro dos requisitos do professor, o projeto precisa ter pelo menos:

- Cadastro de usuário.
- Login.
- Logout.
- Controle de rotas protegidas.
- Perfil de solicitante e suporte.
- Solicitante cria chamado.
- Solicitante lista seus chamados.
- Solicitante edita chamado aberto.
- Solicitante exclui chamado aberto.
- Suporte lista chamados vinculados às próprias sessões.
- Suporte atualiza status.
- Suporte responde chamado.
- Suporte finaliza chamado.
- Dados persistidos no Firestore.
- Interface organizada e responsiva.

---

## 29. Funcionalidades extras opcionais

Essas funcionalidades podem ser citadas como melhorias futuras ou implementadas se houver tempo.

- Histórico completo de alterações do chamado.
- Comentários entre solicitante e suporte.
- Upload de imagem ou anexo.
- Notificações dentro da aplicação.
- Recuperação de senha.
- Perfil administrador.
- Relatórios de chamados resolvidos.
- Gráficos de chamados por categoria.
- Tempo médio de resolução.
- Avaliação do atendimento pelo solicitante.
- Busca por palavra-chave.
- Paginação.
- Modo escuro.

---

## 30. O que evitar no projeto

Para manter o projeto organizado e profissional, evitar:

- Colocar toda lógica dentro das telas.
- Fazer chamadas ao Firebase diretamente em todos os componentes.
- Misturar regra de autenticação com regra visual.
- Usar nomes de variáveis confusos.
- Deixar strings de status espalhadas pelo código.
- Criar telas grandes demais sem componentes menores.
- Não tratar erros.
- Não exibir loading.
- Permitir acesso a rotas protegidas sem validação.
- Permitir que solicitante veja chamado de outro usuário.

---

## 31. Critérios de aceite

O projeto pode ser considerado pronto quando:

- Um usuário consegue se cadastrar.
- Um usuário consegue fazer login.
- Um usuário consegue sair da conta.
- Um solicitante consegue abrir chamado.
- Um solicitante consegue ver apenas seus próprios chamados.
- Um solicitante consegue editar e excluir chamados abertos.
- Um usuário de suporte consegue visualizar chamados vinculados às próprias sessões.
- Um usuário de suporte consegue alterar status.
- Um usuário de suporte consegue responder e finalizar chamados.
- Dados persistem corretamente no Firestore.
- Rotas protegidas funcionam.
- Rotas por perfil funcionam.
- A interface é responsiva.
- A organização do projeto está clara.

---

## 32. Texto de apresentação do projeto

O **TicketFlow** é uma aplicação web desenvolvida com Vue.js e Firebase para gerenciamento de chamados de suporte. A plataforma permite que usuários autenticados abram solicitações, acompanhem o andamento dos atendimentos, conversem em tempo real e visualizem respostas da equipe responsável. O sistema possui dois perfis de acesso: solicitante e suporte. O solicitante pode criar, consultar, editar e excluir seus próprios chamados abertos, enquanto a equipe de suporte visualiza os chamados vinculados às suas sessões de atendimento, assume atendimentos, atualiza status, conversa pelo chat, registra respostas e finaliza solicitações. Todos os dados são armazenados no Cloud Firestore, e o acesso às páginas internas é protegido por autenticação com e-mail e senha.

---

## 33. Resumo para orientar outra IA durante a implementação

Este projeto é uma aplicação Vue.js com Firebase chamada **TicketFlow**. Ela deve funcionar como um sistema de chamados com dois perfis: **solicitante** e **suporte**.

O solicitante entra com um código de atendimento, cria chamados, visualiza apenas os próprios chamados, edita/exclui chamados abertos, conversa no chat e acompanha respostas. O suporte gera códigos de atendimento, visualiza os chamados vinculados às próprias sessões, filtra, assume chamados, altera status, conversa, responde, registra solução e finaliza atendimentos.

A aplicação deve usar Firebase Authentication com e-mail e senha. Após o cadastro, um documento do usuário deve ser criado no Firestore com o campo `role`, que define se ele é `requester` ou `support`. As rotas devem ser protegidas por autenticação e por perfil.

Os dados principais ficam nas coleções `users`, `tickets` e `sessoes`. A coleção `tickets` permite CRUD completo e contém título, descrição, categoria, prioridade, status, solicitante, vínculo de sessão, responsável, resposta, solução, datas e marcadores de última mensagem. Cada chamado também pode ter subcoleções `mensagens` e `historico`.

O projeto está organizado em pastas equivalentes em português: `componentes`, `paginas`, `servicos`, `composables`, `rotas`, `stores`, `constantes`, `utils` e `estilos`. A lógica de Firebase fica em serviços, e as telas usam componentes reutilizáveis.

O objetivo é entregar uma aplicação profissional, simples de usar, responsiva, bem organizada e alinhada aos requisitos acadêmicos: Vue.js, Firebase Authentication, Cloud Firestore, CRUD completo e controle de acesso.

---

## 34. Checklist final para desenvolvimento

### Autenticação

- [x] Cadastro com e-mail e senha
- [x] Login com e-mail e senha
- [x] Logout
- [x] Criação de perfil no Firestore
- [x] Redirecionamento por perfil
- [x] Autoexclusão com reautenticação

### Rotas

- [x] Rotas públicas
- [x] Rotas protegidas
- [x] Bloqueio para usuário não logado
- [x] Bloqueio por perfil
- [x] Bloqueio de solicitante sem sessão ativa

### Solicitante

- [x] Conectar com código de atendimento
- [x] Dashboard do solicitante
- [x] Criar chamado
- [x] Listar meus chamados
- [x] Ver detalhes
- [x] Editar chamado aberto
- [x] Excluir chamado aberto
- [x] Chat e notificações

### Suporte

- [x] Dashboard do suporte
- [x] Gerar/usar sessão de atendimento
- [x] Listar chamados vinculados às sessões
- [x] Filtrar chamados
- [x] Agrupar meus solicitantes
- [x] Assumir chamado
- [x] Atualizar status
- [x] Responder chamado
- [x] Registrar solução
- [x] Finalizar chamado
- [x] Chat e notificações

### Firestore

- [x] Coleção `users`
- [x] Coleção `tickets`
- [x] Coleção `sessoes`
- [x] Subcoleção `mensagens`
- [x] Subcoleção `historico`
- [x] Inserção de dados
- [x] Consulta de dados
- [x] Atualização de dados
- [x] Exclusão de dados
- [ ] Deploy de regras/índices em produção

### Interface

- [x] Layout público
- [x] Layout interno
- [x] Componentes reutilizáveis
- [x] Cards de resumo
- [x] Badges de status
- [x] Badges de prioridade
- [x] Estados de loading
- [x] Estados vazios
- [~] Responsividade implementada; pendente revisão final em dispositivos reais

### Qualidade

- [x] Código organizado
- [x] Serviços separados
- [x] Constantes padronizadas
- [x] Tratamento de erros
- [x] Validações de formulário
- [x] Confirmação antes de excluir
- [x] Nomes claros de arquivos e componentes

---

## 35. Conclusão

O TicketFlow é uma aplicação forte para o projeto final porque não se limita a um CRUD genérico. Ele apresenta um cenário real de uso, com dois perfis de acesso, sessões de atendimento por código, regras de negócio claras, controle de permissões, chat, notificações, fluxo de atendimento e dados persistidos no Firestore.

A aplicação demonstra domínio dos principais pontos exigidos pelo professor: Vue.js, organização por componentes, autenticação, controle de acesso, Cloud Firestore e operações de criar, consultar, atualizar e excluir dados.

O estado atual é de implementação funcional. As pendências principais são validar tudo em Firebase real, fazer deploy das regras/índices, revisar responsividade final, gerar build e publicar o hosting.
