import { ChatManager } from '../ChatManager';


export function eventsUsers(this: ChatManager) {

	this.on('userJoined', (user: any) => {
		console.log('👋 User joined chat:', user);
		// N'ajoute que s'il n'existe pas déjà
		const exists = (this as any).state.onlineUsers.some((u: any) => u.id === user.id);
		if (!exists) {
			(this as any).state.onlineUsers.push({
				id: user.id,
				username: user.nickName || user.login,
				avatar: user.avatar,
				status: 'online'
			});
		} else {
			// Mettre à jour le statut/infos si déjà présent
			(this as any).state.onlineUsers = (this as any).state.onlineUsers.map((u: any) =>
				u.id === user.id ? { ...u, username: user.nickName || user.login, avatar: user.avatar, status: 'online' } : u
			);
	}
        (this as any).renderOnlineUsers();
        (this as any).renderRoomsList();
        (this as any).updateCurrentRoomIndicator((this as any).state.activeTab);
	});

        this.on('userLeft', (user: any) => {
            console.log('👋 User left chat:', user);
            if ((this as any).state.onlineUsers) {
                // Ne pas supprimer, passer le statut à offline pour conserver les données (avatar, etc.)
                (this as any).state.onlineUsers = (this as any).state.onlineUsers.map((u: any) =>
                    u.id === user.id ? { ...u, status: 'offline' } : u
                );
                (this as any).renderOnlineUsers();
                (this as any).renderRoomsList();
                (this as any).updateCurrentRoomIndicator((this as any).state.activeTab);
            }
        });

        this.on('onlineUsersUpdated', (onlineUsers: any[]) => {
            console.log('🔄 Online users list updated:', onlineUsers);
            const existing: any[] = (this as any).state.onlineUsers || [];

            const incomingIds = new Set(onlineUsers.map(u => u.id));
            const updated = [...existing];

            // Upsert entrants: marquer en online et mettre à jour les infos
            for (const u of onlineUsers) {
                const idx = updated.findIndex(x => x.id === u.id);
                const next = {
                    id: u.id,
                    username: u.nickName || u.login,
                    avatar: u.avatar,
                    status: 'online' as const
                };
                if (idx >= 0) updated[idx] = { ...updated[idx], ...next, status: 'online' };
                else updated.push(next);
            }

            // Tous les absents passent en offline
            for (let i = 0; i < updated.length; i++) {
                if (!incomingIds.has(updated[i].id)) {
                    updated[i] = { ...updated[i], status: 'offline' };
                }
            }

            (this as any).state.onlineUsers = updated;
            (this as any).renderOnlineUsers();
            (this as any).renderRoomsList();
            (this as any).updateCurrentRoomIndicator((this as any).state.activeTab);
        });

}
