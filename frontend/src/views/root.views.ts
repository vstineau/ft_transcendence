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
				/>
				<input
					name="password"
					type="password"
					placeholder="Mot de passe"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
					placeholder="login"
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
					type="nickname"
					name="nickname"
					id="nickname"
					placeholder="nickname"
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
				<button
					type="submit"
					class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
				>
					S'inscrire
				</button>
			</form>
		</div>
	`;
}
