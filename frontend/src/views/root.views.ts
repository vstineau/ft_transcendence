
export async function RootView() {
	return /* HTML */ `
		<div class="dashboard">
			<ul>
				<li><a href="/pong">Play</a></li>
				<li><a href="/login">Login</a></li>
				<li><a href="/register">Register</a></li>
				<li><a href="/logout">Logout</a></li>
			</ul>
		</div>
		<button
		    type="logout"
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

export async function SnakeCanvas(){
	// await pongGame();
	return /* HTML */ ` <canvas id="gameCanvas">snake</canvas> `;
}
