// =========================================
// CHAT VIEWS - Toutes les vues liées au chat
// =========================================

// Panel de chat flottant (popup)
export function ChatPanel() {
	return /* HTML */ `
		<div id="chat-panel" class="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl z-40 font-montserrat flex flex-col overflow-hidden">
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
					<button id="tab-pong" class="px-3 py-1 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
						Pong
					</button>
					<button id="tab-snake" class="px-3 py-1 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
						Snake
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
