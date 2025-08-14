export async function RootView() {
    return /* HTML */ `
        <!-- Titre isolé - position absolue dès le départ -->
        <h1 id="main-title" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-black z-50">
            FT<span class="text-blue-600">_</span>TRANSCENDENCE
        </h1>

        <!-- Section Hero - écran complet SANS le titre -->
        <div class="hero-section h-screen flex flex-col justify-center items-center bg-white relative">
            <div class="hero-content text-center pt-20">
                <p class="text-gray-600 text-lg mb-8 mt-8">This project is a surprise.</p>
            </div>

            <!-- Indicateur de scroll en bas -->
            <div class="scroll-indicator absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <span class="text-gray-500 text-sm block mb-2">scroll</span>
                <div class="w-px h-8 bg-gray-200 mx-auto animate-pulse"></div>
            </div>
        </div>

<!-- Section avec les blocs -->
<div class="content-section min-h-screen bg-gray-100 py-16">
    <div class="max-w-7xl mx-auto px-8">

        <!-- Container des blocs en grid complexe -->
        	<div class="grid gap-3 auto-rows-min mx-auto" style="grid-template-columns: 320px 150px 280px 150px; max-width: 1000px;">

			<!-- Bloc Profil Utilisateur - prend 2 colonnes et 2 lignes changer la taille de base du bloc de profil -->
				<div class="row-span-2 bg-white rounded-xl shadow-lg p-4">
					<div class="flex items-start mb-6 ml-3">
						<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold">
							F
						</div>
						<div class="ml-5">
							<h3 class="font-montserrat font-bold text-lg">Fatima Zahra</h3>
							<p class="text-gray-600 text-sm mb-1">@fatiza</p>
							<p class="text-gray-500 text-xs">📍 Paris</p>
						</div>
					</div>

					<div class="flex space-x-6 ml-3">
						<button class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition">View</button>
						<button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-12 py-2 rounded-lg text-sm font-medium transition">Edit</button>
					</div>
				</div>

				<!-- Bloc Games played - 1 colonne, 1 ligne -->
				<div class="row-span-1 bg-white rounded-xl shadow-lg p-4">
					<div class="text-left">
						<p class="font-montserrat text-black text-base mb-2">Games played</p>
						<p class="text-4xl font-bold text-black">20</p>
					</div>
				</div>

				<!-- Bloc Pong Game - 3 colonnes, 2 lignes -->
				<div class="row-span-2 bg-white rounded-xl shadow-lg p-4" style="grid-column: 3 / 5">
					<div class="flex items-center justify-items-center mb-4">
						<h3 class="font-montserrat font-bold text-6xl">Pong</h3>
					</div>

					<p class="font-montserrat font-medium text-gray-700 text-sm leading-5 mb-4">
						Pong is one of the first computer games that ever created, the goal is to defeat your opponent by being the first one to gain a point when he misses the ball.
					</p>

					<div class="flex mt-4">
						<button class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition">Play</button>
					</div>
				</div>

				<!-- Bloc Success rate - 1 colonne, 1 ligne -->
				<div class="row-span-1 bg-white rounded-xl shadow-lg p-4">
					<div class="text-left">
						<p class="font-montserrat text-black text-base mb-2">Success rate</p>
						<p class="text-4xl font-bold text-black">86<span class="text-4xl font-normal text-gray-300">%</span></p>
					</div>
				</div>

				<!-- Bloc Let's talk - 4 colonnes, 1 ligne -->
				<div class="bg-white rounded-xl shadow-lg p-8" style="grid-column: 1 / 3; grid-row: 3">
					<div class="h-full flex flex-col justify-between">
						<h3 class="font-montserrat font-bold text-6xl mb-6">Let's talk</h3>

						<div class="flex items-start space-x-6">
							<div class="text-center">
								<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold">
									L
								</div>
								<span class="text-xs text-gray-600">@LeoApple</span>
							</div>
							<div class="text-center">
								<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold">
									M
								</div>
								<span class="text-xs text-gray-600">@MaxDragon</span>
							</div>
							<div class="text-center">
								<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold">
									F
								</div>
								<span class="text-xs text-gray-600">@FatimaPing</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Bloc Welcome Back -->
				<div style="grid-column: 3 / 5; grid-row: 3;">
					<div class="flex flex-col gap-3 h-full">
						<!-- Welcome Back - moitié haute -->
						<div class="flex-1 bg-white rounded-xl shadow-lg p-4">
							<h3 class="font-montserrat font-bold text-6xl">Welcome<br><span class="text-gray-400">Back</span></h3>
						</div>

						<div class="flex-1 flex gap-3">
						<!-- Light mode avec soleil centre -->
							<div class="flex-1 bg-white rounded-xl shadow-lg p-3 flex flex-col">
								<p class="font-montserrat text-base mb-2">Light mode</p>
								<div class="flex-1 flex items-center justify-center">
									<span class="text-6xl">☼</span>
								</div>
							</div>

							<!-- Settings -->
							<div class="flex-1 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg p-3 flex flex-col">
								<p class="font-montserrat text-white text-base mb-2">Settings</p>
							</div>
						</div>
					</div>
				</div>

        </div>
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
				<input
				    type="checkbox"
					id="2fa"
				    class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150"
				/>
				 <span class="text-gray-700">Activer le 2FA</span>
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
				<li><a href="/pong/matchmaking/localgame">Local Game</a></li>
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
	return /* HTML */ ` <canvas id="gameCanvas">pong</canvas> `;
}

export async function SnakeCanvas(){
	return /* HTML */ ` <canvas id="SnakeGameCanvas">snake</canvas> `;
}

export async function localPongCanvas(){
	return /* HTML */ ` <canvas id="localgameCanvas">pong</canvas> `;
}

export async function localSnakeCanvas(){
	return /* HTML */ ` <canvas id="localSnakeGameCanvas">pong</canvas> `;
}
