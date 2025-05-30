import {
  LoginView,
  PongView,
  RegisterView,
  RootView,
} from "./views/root.views.js";

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
  "/": RootView,
  //"/": async () => "<h1>AAAAAAAAAAAAAA</h1>",
  "/pong": PongView, // Remplace par le vrai contenu ou composant
  "/login": LoginView,
  "/logout": async () => "<h1>LOGOUT</h1>",
  "/register": RegisterView,
};

// 2. Fonction pour naviguer
async function navigateTo(url: string) {
  history.pushState(null, "", url);
  await renderPage();
}

// 3. Rendu de la page selon l’URL courante
async function renderPage() {
  const path = window.location.pathname;
  const view = routes[path] ? await routes[path]() : "<h1>404 Not Found</h1>";
  console.log(view);
  document.getElementById("root")!.innerHTML = view;
}

// 4. Interception des liens (SPA navigation)
document.addEventListener("DOMContentLoaded", async () => {
  document.body.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLAnchorElement) {
      e.preventDefault();
      await navigateTo((target as HTMLAnchorElement).getAttribute("href")!);
    }
  });

  // 5. Gère le bouton "Retour" du navigateur
  window.addEventListener("popstate", renderPage);

  // 6. Rendu initial
  await renderPage();
});
