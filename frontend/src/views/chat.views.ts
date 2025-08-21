// =========================================
// CHAT VIEWS - Toutes les vues liées au chat
// =========================================

export async function ChatView() {
	return /* HTML */ `
		<div class="flex h-screen bg-gray-50">
			<!-- Sidebar avec les salles de chat -->
			<div class="w-80 bg-white border-r border-gray-200 flex flex-col">
				<!-- Header du chat -->
				<div class="p-4 border-b border-gray-200 bg-black">
					<h2 class="text-xl font-bold text-white">Chat</h2>
					<p class="text-gray-300 text-sm">Connecté</p>
				</div>

				<!-- Liste des salles -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-3">
						<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Salles publiques</h3>
						<div id="public-rooms" class="space-y-1">
							<!-- Les salles seront ajoutées dynamiquement -->
						</div>
					</div>

					<div class="p-3 border-t border-gray-100">
						<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Messages privés</h3>
						<div id="private-rooms" class="space-y-1">
							<!-- Les conversations privées seront ajoutées dynamiquement -->
						</div>
					</div>
				</div>

				<!-- Utilisateurs en ligne -->
				<div class="border-t border-gray-200 p-3">
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">En ligne</h3>
					<div id="online-users" class="space-y-2">
						<!-- Les utilisateurs en ligne seront ajoutés dynamiquement -->
					</div>
				</div>
			</div>

			<!-- Zone de chat principale -->
			<div class="flex-1 flex flex-col">
				<!-- Header de la conversation actuelle -->
				<div class="bg-white border-b border-gray-200 px-6 py-4">
					<div id="chat-header" class="flex items-center justify-between">
						<div>
							<h3 id="current-room-name" class="text-lg font-semibold text-gray-900">Sélectionnez une salle</h3>
							<p id="current-room-info" class="text-sm text-gray-500"></p>
						</div>
						<div class="flex space-x-2">
							<button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
							</button>
							<button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>

				<!-- Messages -->
				<div class="flex-1 overflow-y-auto bg-gray-50 p-6">
					<div id="messages-container" class="space-y-4">
						<!-- Message par défaut quand aucune salle n'est sélectionnée -->
						<div id="no-room-selected" class="text-center text-gray-500 mt-20">
							<svg class="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
							</svg>
							<h3 class="text-lg font-medium text-gray-900 mb-2">Commencez une conversation</h3>
							<p class="text-gray-500">Sélectionnez une salle de chat pour commencer à discuter</p>
						</div>
					</div>
				</div>

				<!-- Zone de saisie -->
				<div class="bg-white border-t border-gray-200 p-4">
					<div id="message-input-container" class="hidden">
						<div class="flex items-end space-x-2">
							<div class="flex-1">
								<textarea
									id="message-input"
									placeholder="Tapez votre message..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
									rows="1"
								></textarea>
							</div>
							<div class="flex flex-col space-y-2">
								<button
									id="send-button"
									class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 transition-colors"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
									</svg>
								</button>
								<button
									class="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
									title="Inviter à une partie de Pong"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}

// Panel de chat flottant (popup)
export function ChatPanel() {
	return /* HTML */ `
		<div id="chat-panel" class="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl z-40 font-montserrat flex flex-col overflow-hidden">
			<!-- Header du chat -->
			<div class="bg-black text-white p-4 rounded-t-xl">
				<div class="flex items-center justify-between">
					<h3 class="font-bold text-lg">Chat</h3>
					<button id="chat-close" class="text-white hover:bg-gray-800 rounded p-1">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				<!-- Onglets -->
				<div class="flex mt-3 space-x-1">
					<button id="tab-global" class="px-3 py-1 rounded text-sm bg-gray-800 text-white">
						Global
					</button>
					<button id="tab-private" class="px-3 py-1 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
						Privé
					</button>
				</div>
			</div>

			<!-- Zone des messages -->
			<div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
				<!-- Les messages seront ajoutés dynamiquement -->
			</div>

			<!-- Zone de saisie -->
			<div class="p-3 bg-white border-t border-gray-200">
				<div class="flex items-center space-x-2">
					<input
						id="message-input"
						type="text"
						placeholder="Tapez votre message..."
						class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
					/>
					<button
						id="send-message"
						class="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	`;
}

// Bouton flottant de chat (maintenant dans index.html, mais on garde la fonction pour référence)
export function ChatFloatingButton() {
	return /* HTML */ `
		<button
			id="chat-fab"
			class="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-colors duration-200 z-50 font-montserrat"
			aria-label="Ouvrir le chat"
		>
			<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
			<span id="chat-notif" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg min-w-[20px] h-5 flex items-center justify-center">
				3
			</span>
		</button>
	`;
}
