import { createAvatarElement } from '../utils';

type UserLite = {
	id: string;
	username: string;
	avatar?: string;
	status?: 'online' | 'offline' | 'in-game';
};

type ProfileActionHandlers = {
	viewProfile?: (userId: string) => void;
	privateMessage?: (userId: string) => void;
	block?: (userId: string) => void;
	unblock?: (userId: string) => void;
	isBlocked?: (userId: string) => boolean;
	isSelf?: (userId: string) => boolean;
};

/**
 * Mini UI de profil au survol (style LoL): avatar + actions (profil / MP / block).
 * Usage rapide:
 *   const ui = new UIprofileService({ viewProfile, privateMessage, block, unblock, isBlocked });
 *   ui.attachToContainers(['#messages-container', '#chat-online-users', '#chat-friends-list', '#chat-search-results', '#chat-rooms-list']);
 * Les éléments déclencheurs doivent contenir l'un des attributs: data-user-id | data-online-id | data-friend-id | data-search-id
 */

export class UIprofileService {
	private popoverEl: HTMLDivElement | null = null;
	private hideTimeout: number | null = null;
	private currentUser: UserLite | null = null;
	private handlers: ProfileActionHandlers;

	constructor(handlers: ProfileActionHandlers = {}) {
		this.handlers = handlers;
		this.createPopover();
		this.bindPopoverInteractions();
	}

	public attachToContainers(selectors: string[]): void {
		selectors.forEach(sel => {
			const container = document.querySelector(sel);
			if (!container) return;

			// Délégation: montrer au survol d'un item ayant un data-* ID reconnu
			container.addEventListener('mouseenter', (e) => {
				const target = (e.target as HTMLElement) || null;
				// Ne pas afficher la bulle quand on survole la photo/avatar (wrapper ou image)
				if (target) {
					const overAvatarWrapper = target.closest('.shrink-0, .relative.w-8.h-8, .relative.w-7.h-7') as HTMLElement | null;
					const overAvatarInner = target.closest('img.rounded-full, div.rounded-full') as HTMLElement | null;
					if (overAvatarWrapper || overAvatarInner) {
						return;
					}
				}
				const trigger = target?.closest('[data-user-id], [data-online-id], [data-friend-id], [data-search-id]') as HTMLElement | null;
				if (!trigger) return;
				const user = this.extractUserFromElement(trigger);
				if (!user) return;
				this.showNear(trigger, user);
			}, true);

			// Cacher quand on quitte la zone du container (sans entrer dans le popover)
			container.addEventListener('mouseleave', () => {
				this.scheduleHide();
			});
		});

		// Cacher sur scroll ou clic global
		document.addEventListener('scroll', () => this.hide(), true);
		document.addEventListener('click', (e) => {
			if (!this.popoverEl) return;
			const target = e.target as Node;
			if (this.popoverEl.contains(target)) return;
			this.hide();
		});
	}

	private extractUserFromElement(el: HTMLElement): UserLite | null {
		// Identifier l'attribut d'ID
		const id = el.getAttribute('data-user-id')
			|| el.getAttribute('data-online-id')
			|| el.getAttribute('data-friend-id')
			|| el.getAttribute('data-search-id');
		if (!id) return null;

		// Heuristique pour récupérer username & avatar depuis le DOM
		const username = (el.querySelector('.text-xs')?.textContent || el.getAttribute('data-username') || '').trim() || 'Utilisateur';
		const img = el.querySelector('img') as HTMLImageElement | null;
		const avatar = img?.src || undefined;

		// Status à partir des pastilles de couleur (bg-*) dans l'élément ou via fallback global
		const status = this.readStatusFromDom(el, id);

		return { id, username, avatar, status };
	}

	private readStatusFromDom(scopeEl: HTMLElement, userId: string): 'online' | 'offline' | 'in-game' | undefined {
		// Recherche locale dans l'élément cible
		const local = scopeEl.querySelector('span.bg-green-500, span.bg-blue-500, span.bg-gray-500');
		const mapped = this.mapStatus(local);
		if (mapped) return mapped;

		// Fallback: chercher dans la liste des en ligne
		const inOnline = document.querySelector(`[data-online-id="${CSS.escape(userId)}"] span.bg-green-500, [data-online-id="${CSS.escape(userId)}"] span.bg-blue-500, [data-online-id="${CSS.escape(userId)}"] span.bg-gray-500`) as HTMLElement | null;
		const m2 = this.mapStatus(inOnline);
		if (m2) return m2;

		// Fallback: chercher dans la liste des amis
		const inFriends = document.querySelector(`[data-friend-id="${CSS.escape(userId)}"] span.bg-green-500, [data-friend-id="${CSS.escape(userId)}"] span.bg-blue-500, [data-friend-id="${CSS.escape(userId)}"] span.bg-gray-500`) as HTMLElement | null;
		const m3 = this.mapStatus(inFriends);
		if (m3) return m3;

		return undefined;
	}

	private mapStatus(dotEl: Element | null): 'online' | 'offline' | 'in-game' | undefined {
		if (!dotEl) return undefined;
		const cls = (dotEl as HTMLElement).className || '';
		if (cls.includes('bg-green-500')) return 'online';
		if (cls.includes('bg-blue-500')) return 'in-game';
		if (cls.includes('bg-gray-500')) return 'offline';
		return undefined;
	}

	private createPopover(): void {
		const el = document.createElement('div');
		el.id = 'chat-profile-popover';
		el.style.position = 'absolute';
		el.style.top = '-9999px';
		el.style.left = '-9999px';
		el.style.pointerEvents = 'auto';
		el.className = [
			'hidden',
			'z-50',
			'bg-gray-900',
			'text-white',
			'rounded-lg',
			'shadow-xl',
			'border', 'border-gray-800',
			'p-2',
			'min-w-[220px]'
		].join(' ');

		// Actions par clic (délégation)
		el.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const actionBtn = target.closest('[data-action]') as HTMLElement | null;
			if (!actionBtn || !this.currentUser) return;
			const action = actionBtn.getAttribute('data-action');
			const userId = this.currentUser.id;
			switch (action) {
				case 'profile':
					this.handlers.viewProfile?.(userId);
					this.hide();
					break;
				case 'pm':
					this.handlers.privateMessage?.(userId);
					this.hide();
					break;
				case 'block':
					this.handlers.block?.(userId);
					this.hide();
					break;
				case 'unblock':
					this.handlers.unblock?.(userId);
					this.hide();
					break;
			}
		});

		document.body.appendChild(el);
		this.popoverEl = el as HTMLDivElement;
	}

	private bindPopoverInteractions(): void {
		if (!this.popoverEl) return;
		// Empêcher la fermeture si on survole le popover
		this.popoverEl.addEventListener('mouseenter', () => this.clearHide());
		this.popoverEl.addEventListener('mouseleave', () => this.scheduleHide());
	}

	private renderContent(user: UserLite): string {
		const isBlocked = this.handlers.isBlocked?.(user.id) ?? false;
		const isSelf = this.handlers.isSelf?.(user.id) ?? false;
		const avatar = createAvatarElement(user.username, user.avatar, 'lg');

		const blockedBadge = isBlocked
			? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-red-500/15 text-red-300 border border-red-500/20 shadow-sm">🚫 Bloqué</span>'
			: this.buildStatusBadge(user.status);

	// Toujours afficher le badge de statut (ou bloqué), jamais "👤 Moi"
	const stateBadge = blockedBadge;
		const displayName = this.escape(user.username);

		const actionsHtml = isSelf
			? `
				<button data-action="profile" class="group col-span-3 text-[11px] rounded-md px-2 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 shadow hover:shadow-md transition-all duration-150">
					Profil
				</button>
			`
			: `
				<button data-action="profile" class="group text-[11px] rounded-md px-2 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 shadow hover:shadow-md transition-all duration-150">
					Profil
				</button>
				<button data-action="pm" class="group text-[11px] rounded-md px-2 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 shadow hover:shadow-md transition-all duration-150">
					MP
				</button>
				${isBlocked
					? '<button data-action="unblock" class="group text-[11px] rounded-md px-2 py-1.5 border border-white/10 bg-emerald-600/90 hover:bg-emerald-500 text-white shadow hover:shadow-md transition-all duration-150"><span class="mr-1">✅</span> Débloquer</button>'
					: '<button data-action="block" class="group text-[11px] rounded-md px-2 py-1.5 border border-white/10 bg-red-600/90 hover:bg-red-500 text-white shadow hover:shadow-md transition-all duration-150"><span class="mr-1">🚫</span> Bloquer</button>'}
			`;

		return `
			<div class="rounded-lg bg-gradient-to-b from-gray-900 to-gray-950 p-2 shadow-inner">
				<div class="flex items-center gap-3">
					<div class="relative shrink-0">
						<div class="rounded-full ring-2 ring-white/10 shadow-md shadow-black/40">
							${avatar}
						</div>
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<div class="text-sm font-semibold truncate max-w-[160px]">${displayName}</div>
							${stateBadge}
						</div>
						<div class="text-[11px] text-gray-400/90">${isSelf ? 'C\'est vous' : (isBlocked ? 'Cet utilisateur est bloqué' : 'Clique pour interagir')}</div>
					</div>
				</div>

				<div class="mt-3 pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
					${actionsHtml}
				</div>
			</div>
		`;
	}

	private buildStatusBadge(status?: 'online' | 'offline' | 'in-game'): string {
		// console.log('STAAAAAAAAAAAAAATUUUUUUS: ', status);
		// Conserve le style "Disponible", mais adapte couleur/texte selon le statut détecté dans le DOM
		if (status === 'online') {
			return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">• Disponible</span>';
		}
		if (status === 'in-game') {
			return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-blue-300 border border-yellow-500/20 shadow-sm">• In-game</span>';
		}
		if (status === 'offline') {
			return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-gray-500/10 text-gray-300 border border-gray-500/20 shadow-sm">• Hors-ligne</span>';
		}
		// Fallback par défaut
		return '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">• Refresh</span>';
	}

	public showNear(targetEl: HTMLElement, user: UserLite): void {
		if (!this.popoverEl) return;
		this.currentUser = user;
		this.popoverEl.innerHTML = this.renderContent(user);

		// Positionnement près de l'élément
		const rect = targetEl.getBoundingClientRect();
		const bodyScrollTop = window.scrollY || document.documentElement.scrollTop;
		const bodyScrollLeft = window.scrollX || document.documentElement.scrollLeft;

		// Position par défaut: à droite de l'avatar
		let top = rect.top + bodyScrollTop - 6;
		let left = rect.left + bodyScrollLeft + rect.width + 10;

		// Ajustements pour rester dans le viewport
		const { innerWidth, innerHeight } = window;
		this.popoverEl.style.visibility = 'hidden';
		this.popoverEl.classList.remove('hidden');
		// Mesurer après rendu
		const popRect = this.popoverEl.getBoundingClientRect();

		// Si dépasse à droite, placer à gauche
		if (left + popRect.width > bodyScrollLeft + innerWidth - 8) {
			left = rect.left + bodyScrollLeft - popRect.width - 10;
		}
		// Si dépasse en bas, remonter
		if (top + popRect.height > bodyScrollTop + innerHeight - 8) {
			top = Math.max(bodyScrollTop + 8, bodyScrollTop + innerHeight - popRect.height - 8);
		}
		// Si dépasse en haut, abaisser
		if (top < bodyScrollTop + 8) {
			top = bodyScrollTop + 8;
		}

		this.popoverEl.style.top = `${top}px`;
		this.popoverEl.style.left = `${left}px`;
		this.popoverEl.style.visibility = 'visible';
		this.clearHide();
	}

	public hide(): void {
		if (!this.popoverEl) return;
		this.popoverEl.classList.add('hidden');
		this.popoverEl.style.top = '-9999px';
		this.popoverEl.style.left = '-9999px';
		this.currentUser = null;
		this.clearHide();
	}

	private scheduleHide(delay = 150): void {
		this.clearHide();
		this.hideTimeout = window.setTimeout(() => this.hide(), delay);
	}

	private clearHide(): void {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = null;
		}
	}

	private escape(str: string): string {
		const map: Record<string, string> = {
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
		};
		return str.replace(/[&<>"']/g, (m) => map[m]);
	}
}
