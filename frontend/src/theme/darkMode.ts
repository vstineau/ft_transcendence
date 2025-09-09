export function initThemeToggle(): void{
	const savedTheme: string = localStorage.getItem('theme') || 'light'; //recup le theme sauvegarde ou utiliser light par defaut

	applyTheme(savedTheme);
	//ajout de l'event au bouton
	const themeToggle: HTMLElement | null = document.getElementById('theme-toggle');
	const dashToggle: HTMLElement | null = document.getElementById('dash-theme-toggle');
	const darkmodeFab: HTMLElement | null = document.getElementById('darkmode-fab');
	if(themeToggle){
		themeToggle.addEventListener('click', toggleTheme);
	}
	if(dashToggle){
		dashToggle.addEventListener('click', toggleTheme);
	}
	if(darkmodeFab){
		darkmodeFab.addEventListener('click', toggleTheme);
	}
}

function toggleTheme(): void{
	const currentTheme: string = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	const newTheme: string = currentTheme == 'light' ? 'dark' : 'light';

	applyTheme(newTheme);
	localStorage.setItem('theme', newTheme);
}

export function applyTheme(theme: string): void {
	const html: HTMLElement = document.documentElement;

	const themeText: HTMLElement | null = document.getElementById('theme-text');
	const themeIcon: HTMLElement | null = document.getElementById('theme-icon');
	const mainTitle: HTMLElement | null = document.getElementById('main-title');

	const dashThemeText: HTMLElement | null = document.getElementById('dash-theme-text');
	const dashThemeIcon: HTMLElement | null = document.getElementById('dash-theme-icon');
	const dashMainTitle: HTMLElement | null = document.getElementById('dash-main-title');

	if(theme == 'dark'){
		html.classList.add('dark');
		if(themeText) themeText.textContent = 'Dark mode';
		if(themeIcon) themeIcon.textContent = '☽';
		if(mainTitle) {
			mainTitle.classList.remove('text-black');
			mainTitle.classList.add('text-white');
		}
		if(dashThemeText) dashThemeText.textContent = 'Dark mode';
		if(dashThemeIcon) dashThemeIcon.textContent = '☽';
		if(dashMainTitle) {
			dashMainTitle.classList.remove('text-black');
			dashMainTitle.classList.add('text-white');
		}
	}else {
		html.classList.remove('dark');
		if(themeText) themeText.textContent = 'Light mode';
		if(themeIcon) themeIcon.textContent = '☼';
		if(mainTitle) {
			mainTitle.classList.remove('text-white');
			mainTitle.classList.add('text-black');
		}
		if(dashThemeText) dashThemeText.textContent = 'Light mode';
		if(dashThemeIcon) dashThemeIcon.textContent = '☼';
		if(dashMainTitle) {
			dashMainTitle.classList.remove('text-white');
			dashMainTitle.classList.add('text-black');
		}
	}
}

// Fonction pour nettoyer les event listeners
export function cleanupThemeToggle(): void {
	const themeToggle: HTMLElement | null = document.getElementById('theme-toggle');
	const dashToggle: HTMLElement | null = document.getElementById('dash-theme-toggle');
	if (themeToggle) {
		themeToggle.removeEventListener('click', toggleTheme);
	}
	 if (dashToggle) {
        dashToggle.removeEventListener('click', toggleTheme);
    }
}
