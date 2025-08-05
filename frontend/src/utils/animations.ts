// Variable globale pour pouvoir nettoyer l'événement
let scrollHandler: (() => void) | null = null;

export function initScrollAnimations() {
    const title = document.getElementById('main-title');
    const heroSection = document.querySelector('.hero-section') as HTMLElement;

    if (!title || !heroSection) {
        console.log('Elements not found for animation');
        return;
    }

    // Animation du titre qui monte au scroll
    scrollHandler = () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        const scrollPercent = Math.min(scrollY / heroHeight, 1);

        if (scrollPercent > 0.1) {
            // Quand on scroll, le titre monte et rétrécit
            const translateY = -scrollY * 0.3;
            const scale = Math.max(0.5, 1 - scrollPercent * 0.5);

            // Ajouter la classe CSS et forcer le transform
            title.classList.add('animated');
            title.classList.remove('animated-reset');
            title.style.setProperty('transform', `translateX(-50%) translateY(${Math.max(-50, translateY)}px) scale(${scale})`, 'important');

            console.log('Animation ON - scroll:', scrollY);
        } else {
            // Position initiale
            title.classList.remove('animated');
            title.classList.add('animated-reset');

			title.style.removeProperty('transform');
			title.style.removeProperty('position');
			title.style.removeProperty('top');
			title.style.removeProperty('left');
			title.style.removeProperty('z-index');

            console.log('Animation OFF');
        }
    };

    window.addEventListener('scroll', scrollHandler);
    console.log('Scroll animations initialized');
}

// Fonction pour nettoyer les animations
export function cleanupScrollAnimations() {
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
        console.log('Scroll animations cleaned up');
    }
}