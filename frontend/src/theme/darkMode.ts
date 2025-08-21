export function initThemeToggle(): void{
	const savedTheme: string = localStorage.getItem('theme') || 'light'; //recup le theme sauvegarde ou utiliser light par defaut

	applyTheme(savedTheme);
	//ajout de l'event au bouton
	const themeToggle: HTMLElement | null = document.getElementById('theme-toggle');
	if(themeToggle){
		themeToggle.addEventListener('click', toggleTheme);
	}
}

function toggleTheme(): void{
	const currentTheme: string = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	const newTheme: string = currentTheme == 'light' ? 'dark' : 'light';

	applyTheme(newTheme);
	localStorage.setItem('theme', newTheme);
}

function applyTheme(theme: string): void {
	const html: HTMLElement = document.documentElement;
	const themeText: HTMLElement | null = document.getElementById('theme-text');
	const themeIcon: HTMLElement | null = document.getElementById('theme-icon');
	const mainTitle: HTMLElement | null = document.getElementById('main-title');

	if(theme == 'dark'){
		html.classList.add('dark');
		if(themeText) themeText.textContent = 'Dark mode';
		if(themeIcon) themeIcon.textContent = '☽';
		if(mainTitle) {
			mainTitle.classList.remove('text-black');
			mainTitle.classList.add('text-white');
		}
	} else {
		html.classList.remove('dark');
		if(themeText) themeText.textContent = 'Light mode';
		if(themeIcon) themeIcon.textContent = '☼';
		if(mainTitle) {
			mainTitle.classList.remove('text-white');
			mainTitle.classList.add('text-black');
		}
	}
}

// Fonction pour nettoyer les event listeners
export function cleanupThemeToggle(): void {
	const themeToggle: HTMLElement | null = document.getElementById('theme-toggle');
	if (themeToggle) {
		themeToggle.removeEventListener('click', toggleTheme);
	}
}
