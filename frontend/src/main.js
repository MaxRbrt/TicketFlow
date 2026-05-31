// ============================================================================
// TicketFlow - Ponto de entrada do app Vue
// ----------------------------------------------------------------------------
// Cria a aplicacao, registra Pinia (estado global) e o Vue Router (rotas), e
// inicia a sessao de autenticacao ANTES de montar. Assim, quando o primeiro
// guard de rota roda, o estado de login ja e conhecido (evita "piscar" telas).
// ============================================================================

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./rotas/index.js";
import { useStoreAutenticacao } from "./stores/storeAutenticacao.js";
import "./estilos/index.css";

const app = createApp(App);

// Pinia precisa ser registrado antes de qualquer uso de store.
app.use(createPinia());
app.use(router);

// Inicia a escuta da sessao e so monta o app quando o estado for conhecido.
const auth = useStoreAutenticacao();
auth
  .iniciar()
  .catch((erro) => {
    console.error("Falha ao iniciar autenticacao:", erro?.code || erro);
  })
  .finally(() => {
  app.mount("#app");
});
