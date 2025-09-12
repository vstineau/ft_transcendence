import en from './en'
import es from './es'
import fr from './fr'
import {renderPage} from '../main' 

type Language = 'en' | 'fr' | 'es';

interface Translations {
    [key: string]: string | Translations;
}

export class LanguageManager {
    private currentLanguage: Language = 'en';
    private translations: Record<Language, Translations> = {
        en,
        fr,
        es,
    };

    constructor() {
        // Récupérer la langue stockée ou utiliser celle du navigateur
        const savedLang = localStorage.getItem('preferred-language') as Language;
        const browserLang = navigator.language.split('-')[0] as Language;
        
        this.currentLanguage = savedLang || 
            (['en', 'fr', 'es'].includes(browserLang) ? browserLang : 'en');
    }

    setLanguage(lang: Language): void {
        this.currentLanguage = lang;
        localStorage.setItem('preferred-language', lang);
        document.documentElement.lang = lang;
        // Émettre un événement pour que les composants se mettent à jour
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }

    getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    translate(key: string, fallback?: string): string {
        const keys = key.split('.');
        let value: any = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return typeof value === 'string' ? value : fallback || key;
    }

	updatePageTranslations(): void {
	    // Mise à jour des textes
	    const elements = document.querySelectorAll('[data-translate]');
	    elements.forEach(element => {
	        const key = element.getAttribute('data-translate');
	        if (key) {
	            element.textContent = this.translate(key, element.textContent || '');
	        }
	    });
	
	    // Mise à jour des placeholders
	    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
	    placeholderElements.forEach(element => {
	        const key = element.getAttribute('data-translate-placeholder');
	        if (key && element instanceof HTMLInputElement) {
	            element.placeholder = this.translate(key, element.placeholder || '');
	        }
	    });
	}
}


export async function initializeLanguage() {
    
    window.addEventListener('languageChanged', async (e: Event) => {
        const customEvent = e as CustomEvent;
        await renderPage(); 
    });
}

export function initLanguageSelector() {
    // Pour le dashboard (sélecteur existant)
    const dashboardSelector = document.getElementById('language-selector') as HTMLSelectElement;
    if (dashboardSelector) {
        dashboardSelector.value = languageManager.getCurrentLanguage();
        dashboardSelector.addEventListener('change', async (e) => {
            await handleLanguageChange(e);
        });
    }

    // Pour les autres pages
    const selectors = [
        'language-selector-welcome',
        'language-selector-login', 
        'language-selector-register',
        'language-selector-settings' // ← Ajouter le nouveau sélecteur
    ];

    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId) as HTMLSelectElement;
        if (selector) {
            selector.value = languageManager.getCurrentLanguage();
            selector.addEventListener('change', async (e) => {
                await handleLanguageChange(e);
            });
        }
    });

    // Appliquer les traductions au chargement initial
    setTimeout(() => {
        languageManager.updatePageTranslations();
    }, 100);
}

export async function handleLanguageChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const newLang = target.value as any;
    
    languageManager.setLanguage(newLang);
    languageManager.updatePageTranslations();
}


export const languageManager = new LanguageManager();
export const t = (key: string, fallback?: string) => languageManager.translate(key, fallback);
