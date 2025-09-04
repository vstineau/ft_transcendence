/**
 * Utilitaires pour la gestion des avatars
 */

export function getAvatarColor(username: string): string {
    // Générer une couleur basée sur le nom d'utilisateur
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
        'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

export function createAvatarElement(username: string, avatarPath?: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
    const sizeClasses = {
        sm: 'w-7 h-7 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm'
    };

    const sizeClass = sizeClasses[size];
    
    if (avatarPath) {
        return `<img src="${avatarPath}" alt="avatar" class="${sizeClass} rounded-full object-cover shrink-0" />`;
    } else {
        const avatarColor = getAvatarColor(username);
        const initial = username.charAt(0).toUpperCase();
        return `<div class="${sizeClass} rounded-full ${avatarColor} flex items-center justify-center text-white font-bold shrink-0">${initial}</div>`;
    }
}
