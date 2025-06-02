export async function RootView() {
	return /* HTML */ `
		<div class="text-center space-y-6 animate-fade-in">
			<h1 class="text-4xl font-bold text-blue-600">Bienvenue 👋</h1>
			<p class="text-gray-600">Choisis une page :</p>

			<div class="flex flex-col items-center space-y-3">
				<a href="/pong" data-link class="text-blue-500 hover:underline transition">➡️ Aller à Pong</a>
				<a href="/login" data-link class="text-green-500 hover:underline transition">🔐 Se connecter</a>
				<a href="/register" data-link class="text-purple-500 hover:underline transition">📝 S'inscrire</a>
				<a href="/logout" data-link class="text-red-500 hover:underline transition">🚪 Se déconnecter</a>
			</div>
		</div>
	`;
}

export async function PongView() {
	return /* HTML */ `
		<div class="text-center customclass">
			<h1 class="text-4xl font-extrabold text-green-600">🏓 Pong !</h1>
			<p class="text-gray-600 mt-4">Réponse du serveur : tout fonctionne !</p>
		</div>
		<div class="container-fluid login-container"></div>
	`;
}

export async function LoginView() {
	return /* HTML */ `
		<div class="max-w-md mx-auto bg-black p-6 rounded-lg shadow-lg animate-slide-up">
			<h2 class="text-2xl font-bold mb-4 text-center text-blue-700">Connexion</h2>
			<form class="space-y-4">
				<input
					type="email"
					placeholder="Email"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<input
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
		<div class="max-w-md mx-auto bg-black p-6 rounded-lg shadow-lg animate-fade-in">
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
