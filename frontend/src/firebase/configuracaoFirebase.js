// Configuracao do Firebase para o plano FREE (Spark): usamos Authentication,
// Cloud Firestore, Hosting e Analytics opcional. Storage e Cloud Functions
// exigem Blaze para este escopo e nao sao usados no app.
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  initializeAuth,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLPa0xXX_NsbU0c0TT8feE-y4gqxx6mYA",
  authDomain: "projetoticketflow.firebaseapp.com",
  projectId: "projetoticketflow",
  messagingSenderId: "698228753644",
  appId: "1:698228753644:web:61798325db6df53a2f91c9",
  measurementId: "G-117HC5C358",
};

const app = initializeApp(firebaseConfig);

// IMPORTANTE: persistencia POR ABA (sessionStorage), nao a padrao 'local'.
//
// Com a persistencia padrao (browserLocalPersistence) a sessao fica em
// localStorage, que e COMPARTILHADO entre todas as abas do mesmo navegador, e o
// Firebase sincroniza o estado entre elas. Logar como solicitante numa aba
// sobrescrevia o token de suporte da outra aba -> a aba de suporte "virava"
// solicitante. Isso e intrinseco ao 'local': um navegador = uma sessao.
//
// browserSessionPersistence usa sessionStorage: cada aba/janela tem a SUA
// sessao, isolada das demais (permite logar suporte numa aba e solicitante em
// outra, no mesmo navegador) e sobrevive ao F5 da propria aba. inMemory entra
// como fallback caso o sessionStorage esteja indisponivel (ainda por aba).
//
// Trade-off: fechar a aba/navegador encerra a sessao (nao "lembra" o login).
const auth = initializeAuth(app, {
  persistence: [browserSessionPersistence, inMemoryPersistence],
});

const db = getFirestore(app, "default");

const analyticsPromise =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null);

export { app, auth, db, analyticsPromise };
