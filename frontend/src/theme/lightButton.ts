import { applyTheme } from './darkMode'


export function DarkModeFloatingButton(): string {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';

    return /* HTML */ `
        <button
            id="darkmode-fab"
            class="fixed bottom-6 left-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-colors duration-200 z-50 font-montserrat"
            aria-label="Toggle dark mode"
        >
            <span id="darkmode-icon" class="text-2xl transition-transform hover:scale-110">
                ${isDark ? '☽' : '☼'}
            </span>
        </button>
    `;
}


export async function displayDarkModeButton() {
    // Vérifier si le bouton n'existe pas déjà
    if (document.getElementById('darkmode-fab')) {
        // console.log('Bouton dark mode déjà présent');
        return;
    }

    // console.log('✅ Création du bouton dark mode');
    document.body.insertAdjacentHTML('beforeend', DarkModeFloatingButton());

    // Ajouter l'event listener
    const darkmodeFab = document.getElementById('darkmode-fab');
    if (darkmodeFab) {
        darkmodeFab.addEventListener('click', () => {
            toggleDarkMode();
            updateDarkModeIcon();
        });
    }
}

function toggleDarkMode(): void {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Utiliser votre fonction existante
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function updateDarkModeIcon(): void {
    const icon = document.getElementById('darkmode-icon');
    const isDark = document.documentElement.classList.contains('dark');

    if (icon) {
        icon.textContent = isDark ? '☽' : '☼';
    }
}