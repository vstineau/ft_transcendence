export async function RootView() {
    return /* HTML */ `
        <!-- Section Hero - écran complet avec le titre centré -->
        <div class="hero-section h-screen flex flex-col justify-center items-center bg-white relative">
            <div class="hero-content text-center">
                <h1 id="main-title" class="text-6xl font-bold text-black mb-4">
                    FT_TRANSCENDENCE
                </h1>
                <p class="text-gray-600 text-lg mb-8">This project is a surprise.</p>
            </div>

            <!-- Indicateur de scroll en bas -->
            <div class="scroll-indicator absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <span class="text-gray-500 text-sm block mb-2">scroll</span>
                <div class="w-px h-8 bg-gray-400 mx-auto animate-pulse"></div>
            </div>
        </div>

        <!-- Section vide pour permettre le scroll -->
        <div class="content-section h-screen bg-gray-100 flex items-center justify-center">
            <div class="text-center">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Scrollez vers le haut pour voir l'effet</h2>
                <p class="text-gray-600">Le titre devrait être maintenant en haut de la page</p>
            </div>
        </div>

        <!-- Logout button (caché par défaut) -->
        <button
            type="button"
            id="logout"
            class="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
            style="display: none;"
        >
            Logout
        </button>
    `;
}

// <img src="https://i.gifer.com/QgxJ.gif" alt="pong" />
export async function PongView() {
	return /* HTML */ `
		<div class="dashboard">
			<ul>
				<li><a href="/pong/matchmaking">Quick match</a></li>
				<li><a href="/pong/tournament">Tournament</a></li>
				<li><a href="/pong/stats">Stats</a></li>
				<li><a href="/pong/leaderboard">Leaderboard</a></li>
				<li><a href="/">Main Menu</a></li>
			</ul>
		</div>
	`;
}

export async function LoginView() {
	return /* HTML */ `
		<div class="max-w-md mx-auto p-6 rounded-lg shadow-lg animate-slide-up">
			<h2 class="text-2xl font-bold mb-4 text-center text-blue-700">Connexion</h2>
			<form id="login-form" class="space-y-4">
				<input
					name="login"
					type="text"
					placeholder="Login"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					autocomplete="off"
					required
				/>
				<input
					name="password"
					type="password"
					placeholder="Mot de passe"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				/>
				<button
					type="submit"
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
				>
					Se connecter
				</button>
			</form>
		</div>
	`;
}

export async function RegisterView() {
	return /* HTML */ `
		<div class="max-w-md mx-auto p-6 rounded-lg shadow-lg animate-fade-in">
			<h2 class="text-2xl font-bold mb-4 text-center text-purple-700">Créer un compte</h2>
			<form id="register-form" class="space-y-4">
				<input
					autocomplete="off"
					type="text"
					name="login"
					id="login"
					placeholder="Login"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
					required
				/>
				<input
					autocomplete="off"
					type="text"
					name="nickname"
					id="nickname"
					placeholder="Nickname"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
					required
				/>
				<input
					autocomplete="off"
					type="email"
					name="email"
					id="mail"
					placeholder="Email"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
					required
				/>
				<input
					type="password"
					name="password"
					id="password"
					placeholder="Mot de passe"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
					required
				/>
				<input
					type="file"
					name="avata"
					id="avatar"
					placeholder="inserer avatar"
					accept="image/jpeg, image/png, image/jgp, image/gif"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<button
					type="submit"
					class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
				>
					S'inscrire
				</button>
			</form>
			<div
				id="error-message"
				class="w-full px-4 hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-20"
				style="display: none;"
				role="alert"
			></div>
		</div>
	`;
}

export async function PongMatchMakingView() {
	return /* HTML */ `
		<div class="dashboard">
			<ul>
				<li><a href="/pong/matchmaking/game">Find Match</a></li>
			</ul>
		</div>
	`;
}

export async function UpdateInfosview() {
	return /* HTML */ `
		<div class="max-w-md mx-auto p-6 rounded-lg shadow-lg animate-fade-in">
			<h2 class="text-2xl font-bold mb-4 text-center text-purple-700">Modifier le compte</h2>
			<form id="register-form" class="space-y-4">
				<input
					autocomplete="off"
					type="text"
					name="login"
					id="login"
					placeholder="Login"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<input
					autocomplete="off"
					type="text"
					name="nickname"
					id="nickname"
					placeholder="Nickname"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<input
					autocomplete="off"
					type="email"
					name="email"
					id="mail"
					placeholder="Email"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<input
					type="password"
					name="password"
					id="password"
					placeholder="Mot de passe"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<input
					type="password"
					name="newPassword"
					id="newPassword"
					placeholder="Nouveau Mot de passe"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<input
					type="file"
					name="avatar"
					id="avatar"
					placeholder="inserer avatar"
					accept="image/jpeg, image/png, image/jgp, image/gif"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<button
					type="save updates"
					class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
				>
				Save updates
				</button>
			</form>
			<button
				id="defaultAvatars"
				class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
			>
			No avatar
			</button>
			<div
				id="error-message"
				class="w-full px-4 hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-20"
				style="display: none;"
				role="alert"
			></div>
		</div>
	`;
}
export async function PongCanvas(){
	// await pongGame();
	return /* HTML */ ` <canvas id="gameCanvas">pong</canvas> `;
}
