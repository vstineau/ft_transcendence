/**
 * Panel principal du chat (popup)
 */
export function ChatPanel(): string {
    return /* HTML */ `
        <div id="chat-panel" class="fixed bottom-24 right-6 w-[700px] h-[600px] bg-white rounded-xl shadow-2xl z-40 font-montserrat flex flex-col overflow-hidden">
            <!-- Header du chat -->
            <div class="bg-black text-white p-4 rounded-t-xl flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <h3 class="font-bold text-lg">Chat</h3>
                    <div id="current-room-indicator" class="bg-gray-700 px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                        <span id="room-indicator-icon">🌐</span>
                        <span id="room-indicator-text">Global</span>
                    </div>
                </div>
                <button id="chat-close" class="text-white hover:bg-gray-800 rounded p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <!-- Corps avec sidebar + zone messages -->
            <div class="flex flex-1 overflow-hidden">
                <!-- Sidebar -->
                <div class="w-50 bg-gray-900 text-gray-200 flex flex-col p-2 text-sm space-y-3">
                    <!-- Recherche -->
                    <div class="space-y-2">
                        <input id="chat-user-search" type="text" placeholder="Rechercher..." class="w-full px-2 py-1 rounded bg-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-gray-500" />
                        <div id="chat-search-results" class="max-h-32 overflow-y-auto space-y-1 hidden"></div>
                    </div>
                    <!-- Utilisateurs en ligne -->
                    <div class="flex-1 overflow-hidden flex flex-col">
                        <div class="uppercase tracking-wide text-[10px] text-gray-400 px-1 mb-1">En ligne</div>
                        <div id="chat-online-users" class="space-y-1 overflow-y-auto pr-1 custom-scrollbar flex-1"></div>
                            <!-- Les en lignes seront ajoutés dynamiquement -->
                    </div>
                    <!-- Friends (au milieu) -->
                    <div class="border-t border-gray-800 pt-2">
                        <div class="uppercase tracking-wide text-[10px] text-gray-400 px-1 mb-1">Friends</div>
                        <div id="chat-friends-list" class="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            <!-- Les amis seront ajoutés dynamiquement -->
                        </div>
                    </div>
                    <!-- rooms (tout en bas) -->
                    <div class="border-t border-gray-800 pt-2">
                        <div class="uppercase 	tracking-wide text-[10px] text-gray-400 px-1 mb-1">Rooms</div>
                        <div id="chat-rooms-list" class="space-y-1">
                            <!-- Les rooms seront ajoutées dynamiquement -->
                        </div>
                    </div>
                </div>
                <!-- Zone principale -->
                <div class="flex flex-col flex-1">
                    <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        <!-- Messages dynamiques -->
                    </div>
                    <div class="p-3 bg-white border-t border-gray-200">
						<div class="flex items-center gap-2">
						    <input id="message-input" type="text" placeholder="Tapez votre message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500" />
						    <!-- Bouton Envoyer -->
						    <button id="send-message" class="bg-black hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center w-10 h-10">
						        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
						        </svg>
						    </button>
						    <!-- Bouton Ping Pong -->
						    <button id="pong-button" class="bg-black hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center w-10 h-10">
						        <span class="text-xl">🏓</span>
						    </button>
						    <!-- Bouton Snake -->
						    <button id="snake-button" class="bg-black hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center w-10 h-10">
						        <span class="text-xl">🐍</span>
						    </button>
						</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
