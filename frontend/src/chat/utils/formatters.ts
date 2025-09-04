/**
 * Utilitaires pour le formatage des dates et du HTML
 */

export function formatTime(date: Date | string): string {
    // S'assurer que nous avons un objet Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier que la conversion s'est bien passée
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    
    if (diff < 60000) {
        return 'À l\'instant';
    } else if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}min`;
    } else {
        return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
}

export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
