// 1. Déclaration des routes
const routes: { [key: string]: () => string } = {
  "/": () => "<h1>Dashboard</h1>",
  "/pong": () => "<h1>Posts</h1>", // Remplace par le vrai contenu ou composant
  "/register": () => "<h1>Settings</h1>"
};

// 2. Fonction pour naviguer
function navigateTo(url: string) {
  history.pushState(null, "", url);
  renderPage();
}

// 3. Rendu de la page selon l’URL courante
function renderPage() {
  const path = window.location.pathname;
  const view = routes[path] ? routes[path]() : "<h1>404 Not Found</h1>";
  document.getElementById("root")!.innerHTML = view;
}

// 4. Interception des liens (SPA navigation)
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo((target as HTMLAnchorElement).getAttribute("href")!);
    }
  });

  // 5. Gère le bouton "Retour" du navigateur
  window.addEventListener("popstate", renderPage);

  // 6. Rendu initial
  renderPage();
});
