// Variable globale pour pouvoir nettoyer l'événement
let scrollHandler: (() => void) | null = null;

export function initScrollAnimations() {
    const title = document.getElementById('main-title');
    const heroSection = document.querySelector('.hero-section') as HTMLElement;

    if (!title || !heroSection) {
        // console.log('Elements not found for animation');
        return;
    }

    // Animation du titre qui monte au scroll
    scrollHandler = () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        const scrollPercent = Math.min(scrollY / heroHeight, 1);

        // Animation fluide et continue - UNE SEULE méthode
        if (scrollPercent > 0.05) { // Commence très tôt pour éviter les sauts

            // Progression de l'animation de 0 à 1
            const progress = Math.min((scrollPercent - 0.05) / 0.65, 1); // 0.05 à 0.7 = transition complète

            // Interpolation fluide de tous les paramètres
            const moveY = -progress * window.innerHeight * 0.4; // Monte progressivement
            const scale = 1 - (progress * 0.4); // Rétrécit de 1 à 0.6

            // UNE SEULE méthode : toujours en position fixed pour éviter les sauts
            title.style.setProperty('position', 'fixed', 'important');
            title.style.setProperty('left', '50%', 'important');
            title.style.setProperty('z-index', '1000', 'important');

            // Position Y progressive : commence au centre, finit en haut
            const centerY = window.innerHeight * 0.5 - 60; // Position du centre (ajustez selon votre design)
            const topY = 20; // Position finale en haut
            const currentY = centerY + (topY - centerY) * progress;

            title.style.setProperty('top', `${currentY}px`, 'important');
            title.style.setProperty('transform', `translateX(-50%) scale(${scale})`, 'important');

        } else {
            // Complètement en haut de page - retour à la position normale
            title.style.removeProperty('position');
            title.style.removeProperty('top');
            title.style.removeProperty('left');
            title.style.removeProperty('transform');
            title.style.removeProperty('z-index');

            // console.log('Animation OFF - position normale');
        }
    };

    window.addEventListener('scroll', scrollHandler);
    // console.log('Scroll animations initialized');
}

// Fonction pour nettoyer les animations
export function cleanupScrollAnimations() {
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
        // console.log('Scroll animations cleaned up');
    }
}