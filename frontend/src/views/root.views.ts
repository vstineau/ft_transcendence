import { promises } from 'readline';

export async function RootView() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 id="dash-main-title" class="text-center text-4xl font-bold text-black">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<!-- Section avec les blocs -->
		<div class="content-section min-h-screen bg-gray-100 py-16">
			<div class="max-w-7xl mx-auto px-8 ">
				<!-- Container des blocs en grid complexe -->
				<div
					class="grid gap-3 auto-rows-min mx-auto mt-36 justify-center"
					style="grid-template-columns: 320px 150px 280px 150px; max-width: 1000px;"
				>
					<!-- Bloc Profil Utilisateur - prend 2 colonnes et 2 lignes changer la taille de base du bloc de profil -->
					<div class="row-span-2 bg-white rounded-xl shadow-lg p-4">
						<div class="flex items-start mb-6 ml-3">
							<div id="profile-avatar-container" class="w-32 h-32 bg-gray-200 rounded-xl overflow-hidden">
								<!-- L'avatar ou le fallback sera injecté ici -->
							</div>

							<div class="ml-5">
								<h3 id="profile-display-name" class="font-montserrat font-bold text-lg">Loading...</h3>

								<!-- NOM UTILISATEUR -->
								<p id="profile-username" class="text-gray-600 text-sm mb-1">@loading...</p>

								<!-- EMAIL OU LOCALISATION -->
								<p id="profile-location" class="text-gray-500 text-xs">Loading...</p>
							</div>
						</div>

						<div class="flex space-x-6 ml-3">
							<button
								class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition"
							>
								View
							</button>
							<a
								href="/updateInfos"
								class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-12 py-2 rounded-lg text-sm font-medium transition"
								>Edit</a
							>
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
							Pong is one of the first computer games that ever created, the goal is to defeat your opponent by
							being the first one to gain a point when he misses the ball.
						</p>

						<div class="flex mt-4">
							<a
								href="/pong"
								class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition"
								>Play</a
							>
						</div>
					</div>

					<!-- Bloc Success rate - 1 colonne, 1 ligne -->
					<div class="row-span-1 bg-white rounded-xl shadow-lg p-4">
						<div class="text-left">
							<p class="font-montserrat text-black text-base mb-2">Success rate</p>
							<p class="text-4xl font-bold text-black">
								86<span class="text-4xl font-normal text-gray-300">%</span>
							</p>
						</div>
					</div>

					<!-- Bloc Let's talk - 4 colonnes, 1 ligne -->
					<div class="bg-white rounded-xl shadow-lg p-8" style="grid-column: 1 / 3; grid-row: 3">
						<div class="h-full flex flex-col justify-between">
							<h3 class="font-montserrat font-bold text-6xl mb-6">Let's talk</h3>

							<div class="flex items-start space-x-6">
								<div class="text-center">
									<div
										class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold"
									>
										L
									</div>
									<span class="text-xs text-gray-600">@LeoApple</span>
								</div>
								<div class="text-center">
									<div
										class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold"
									>
										M
									</div>
									<span class="text-xs text-gray-600">@MaxDragon</span>
								</div>
								<div class="text-center">
									<div
										class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold"
									>
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
								<h3 class="font-montserrat font-bold text-6xl">
									Welcome<br /><span class="text-gray-400">Back</span>
								</h3>
							</div>

							<div class="flex-1 flex gap-3">
								<!-- Light mode avec soleil centre -->
								<div
									id="dash-theme-toggle"
									class="flex-1 bg-white rounded-xl shadow-lg p-3 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
								>
									<p class="font-montserrat text-base mb-2" id="dash-theme-text">Light mode</p>
									<div class="flex-1 flex items-center justify-center">
										<span class="text-6xl transition-transform hover:scale-110" id="dash-theme-icon">☼</span>
									</div>
								</div>

								<!-- Settings -->
								<a
									href="/updateInfos"
									class="flex-1 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg p-3 flex flex-col"
								>
									<p class="font-montserrat text-white text-base mb-2">Settings</p>
								</a>
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
			class="font-montserrat fixed top-4 right-4 z-50 bg-black hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg"
			style="display: none;"
		>
			Logout
		</button>
	`;
}

export async function WelcomeView() {
	return /* HTML */ `
        <!-- Titre isolé - position absolue dès le départ -->
        <h1 id="main-title" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-black z-50">
            FT<span class="text-blue-600">_</span>TRANSCENDENCE
        </h1>

        <!-- Section Hero - écran complet SANS le titre -->
        <div class="hero-section h-screen flex flex-col justify-center items-center bg-gray-100 relative">
            <div class="hero-content text-center pt-20">
                <p class="text-gray-600 text-lg mb-8 mt-8">Choose your adventure.</p>
            </div>

            <!-- Indicateur de scroll en bas -->
            <div class="scroll-indicator absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <span class="text-gray-500 text-sm block mb-2">scroll</span>
                <div class="w-px h-8 bg-gray-200 mx-auto animate-pulse"></div>
            </div>
        </div>

        <!-- Section avec les blocs -->
        <div class="content-section min-h-screen bg-gray-100 py-16">
            <div class="max-w-4xl mx-auto px-8">
                <!-- Container des blocs en grid simple -->
                <div class="grid gap-4 mx-auto mt-36 justify-center" style="grid-template-columns: 200px 200px 200px; max-width: 600px;">

                    <!-- Bloc Sign up - Plus large -->
                    <a href="/login" class="bg-black hover:bg-gray-800 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col items-start justify-start transition-colors ">
                        <p class="font-montserrat font-medium text-white text-base mb-2">Sign in</p>
                    </a>

                    <!-- Bloc Light mode - Carré -->
                    <div id="theme-toggle" class="bg-white rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors">
					<p class="font-montserrat font-medium text-base text-gray-600" id="theme-text">Light mode</p>
					<div class="flex-1 flex items-center justify-center">
						<span class="text-3xl" id="theme-icon">☼</span>
					</div>
				</div>

                    <!-- Bloc Games - Carré -->
                    <a href="/pong" class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors">
					<p class="font-montserrat font-medium text-base text-gray-600">Games</p>
					<div class="flex-1 flex items-center justify-center">
						<span class="text-2xl">▶</span>
					</div>
					</a>
            	</div>
			</div>
			<!-- Bouton Create an account - Large en dessous -->
			<div class="mt-4" style="max-width: 616px; margin-left: auto; margin-right: auto;">
                    <a href="/register" class="font-montserrat block bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-medium text-lg transition-colors text-center" >
                        Create an account
                    </a>
            </div>
        </div>
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
				<li><a href="/">Main Menu</a></li>
			</ul>
		</div>
	`;
}

export async function LoginView() {
	return /*HTML*/ `
		 <!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 class="text-center text-4xl font-bold text-black">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<div class="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-4">
			<!--conteneur principal-->
			<div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">

			<!-- Titre -->
			<h2 class="text-2xl font-semibold text-center text-black mb-8">Welcome back !</h2>
			<form id="login-form" class="space-y-4">

				<!--login-->
				<input
					autocomplete="off"
					type="login"
					name="login"
					id="login"
					placeholder="login"
					class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
					required
                />

				<!-- Mot de passe -->
				<input
					type="password"
					name="password"
					id="password"
					placeholder="Password"
					class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
					required
				/>

				<!-- Bouton S'inscrire -->
					<div class="flex justify-center pt-4">
						<button
							type="submit"
							class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">Sign in</button>
					</div>
                </form>

				 <!-- Lien vers connexion -->
				<div class="mt-4 text-center">
					<p class="text-sm text-gray-600">
						Don't have an account ?
						<a href="/register?/login" class="text-black hover:underline font-medium">Sign up</a>
					</p>
				</div>

		</div>
	`;
}

export async function RegisterView() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 class="text-center text-4xl font-bold text-black">FT<span class="text-blue-600">_</span>TRANSCENDENCE</h1>
		</div>
		<!-- Arrière-plan -->
		<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
			<!-- Container principal blanc centré -->
			<div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
				<!-- Titre -->
				<h2 class="text-2xl font-semibold text-center text-black mb-8">Create an account</h2>

				<!-- Formulaire -->
				<form id="register-form" class="space-y-6">
					<!-- Ligne Login + Nickname -->
					<div class="grid grid-cols-2 gap-4">
						<input
							autocomplete="off"
							type="text"
							name="login"
							id="login"
							placeholder="Login"
							class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
							required
						/>
						<input
							autocomplete="off"
							type="text"
							name="nickname"
							id="nickname"
							placeholder="Nickname"
							class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
							required
						/>
					</div>

					<!-- Email -->
					<input
						autocomplete="off"
						type="email"
						name="email"
						id="mail"
						placeholder="Email"
						class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
						required
					/>

					<!-- Mot de passe -->
					<input
						type="password"
						name="password"
						id="password"
						placeholder="Mot de passe"
						class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
						required
					/>

					<!-- Upload de fichier -->
					<div class="space-y-2">
						<label class="block text-sm text-gray-600">Photo de profil (optionnel)</label>
						<input
							type="file"
							name="avatar"
							id="avatar"
							accept="image/jpeg, image/png, image/jpg, image/gif"
							class="w-full px-0 py-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"
						/>
					</div>

					<!-- 2fa formulaire -->
					<div class="flex justify-center">
						<div class="flex items-center space-x-3">
							<input
								id="enable2fa"
								name="enable2fa"
								type="checkbox"
								value="1"
								class="w-4 h-4 accent-black focus:outline-none"
							/>
							<label for="enable2fa" class="text-sm text-gray-700"> Enable dual authentication </label>
						</div>
					</div>

					<!-- Bouton S'inscrire -->
					<div class="flex justify-center">
						<button
							type="submit"
							class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
						>
							Sign up
						</button>
					</div>
				</form>

				<!-- infos private privacy -->
				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						Signing up for a Ft_transcendence means you agree to the .
						<a href="/privacy" class="text-black hover:underline font-medium">Privacy Policy</a>
						and
						<a href="/terms" class="text-black hover:underline font-medium">Terms of Service</a>.
					</p>
				</div>

				<!-- Lien vers connexion -->
				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						Have an account ?
						<a href="/login" class="text-black hover:underline font-medium">Sign in</a>
					</p>
				</div>

				<!-- Message d'erreur -->
				<div
					id="error-message"
					class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
					role="alert"
				></div>
			</div>
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

<!-- Titre FT_TRANSCENDENCE en haut -->
	<div class="bg-gray-100 py-2">
		<h1 class="text-center text-4xl font-bold text-black">
			FT<span class="text-blue-600">_</span>TRANSCENDENCE
		</h1>
	</div>


	<div class="min-h-screen bg-gray-100 py-8 px-4">
		<div class="max-w-4xl mx-auto">

			<!-- creer les onglets-->
			<div class="flex border-b border-gray-300 mb-8">
				<button class="tab-button active px-6 px-3 front-medium font-montserrat text-sm focus:outline-none border-b-2 transition-colors" data-tab="profil">
					Profil
				</button>

				<button
					class="font-montserrat tab-button px-6 py-3 font-medium text-sm focus:outline-none border-b-2 transition-colors" data-tab="general">
					General
				</button>
			</div>

                <!-- Contenu des onglets -->
                <div class="flex gap-8">

                    <!-- Sidebar gauche avec menu -->
                    <div class="w-64">

                        <!-- Profil utilisateur -->
							<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
							<div class="font-montserrat flex items-center">

							<!-- CONTAINER PRINCIPAL -->
							<div id="avatar-container" class="w-12 h-12 bg-gray-300 rounded-lg overflow-hidden">
								<!-- Seul l'avatar OU le fallback sera affiché, pas les deux -->
							</div>

							<div class="ml-5 flex-1">
								<div class="flex items-center">
									<h3 id="user-name" class="font-montserrat font-bold text-black">Loading...</h3>
									<button id="edit-profile-btn" class="ml-2 text-gray-500 hover:text-black transition-colors text-xl" title="Edit profile">
									✍︎
									</button>
								</div>
								<p class="font-montserrat text-sm text-gray-500">Profil settings</p>
							</div>
						</div>
                    </div>

                        <!-- Menu latéral pour onglet Profil -->
                        <div id="profil-menu" class="tab-menu">
                            <div class="space-y-2">
                                <button class="font-montserrat menu-item active w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="change-password">
                                    <span class="w-5 h-5 mr-3 text-lg">ꗃ</span>
                                    Change password
                                </button>
                                <button class="font-montserrat menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center"  data-content="dual-authentication">
                                    <span class="w-5 h-5 mr-3 text-lg">✓</span>
                                    Dual authentication
                                </button>
                                <button class="font-montserrat menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center"  data-content="profile-picture">
                                    <span class="w-5 h-5 mr-3">👤</span>
                                    Profile picture
                                </button>
                            </div>
                        </div>

                        <!-- Menu latéral pour onglet General (caché par défaut) -->
                        <div id="general-menu" class="tab-menu hidden">
                            <div class="space-y-2">
                                <button class="menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="language">
                                    <span class="w-5 h-5 mr-3">🗣</span>
                                    Langage
                                </button>
                                <button class="menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="privacy-policy">
                                    <span class="w-5 h-5 mr-3 text-lg">⚖︎</span>
                                    General privacy police<br>
									& terms of service
                                </button>
                                <button class="menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="delete">
                                    <span class="w-5 h-5 mr-3">🗑</span>
                                    Delete your account
                                </button>
                            </div>
                        </div>
                    </div>

					<!-- Zone de contenu principal -->
                    <div class="flex-1">
                        <div id="content-area" class="flex max-w-md w-full bg-white rounded-2xl shadow-md p-8 ml-16 mt-12">
                            <!-- Le contenu changera ici dynamiquement -->
                        </div>
                    </div>
                </div>

						<!-- Bouton retour -->
						<div class="mt-8 text-center">
							<a href="/dashboard" class="text-gray-600 hover:text-black transition-colors">← Retour au Dashboard</a>
						</div>
					</div>
				</div>

						</div>
					</div>
				</div>

			<style>
				.tab-button {
					border-bottom-color: transparent;
					color: #6B7280; /* Gris par défaut */
				}
				.tab-button.active {
					border-bottom-color: #000000; /* Bordure noire */
					color: #000000; /* Texte noir */
				}

				/* Styles pour les menu items - noir et blanc */
				.menu-item {
					background-color: transparent;
					color: #000000; /* Texte noir par défaut */
				}
				.menu-item:hover {
					background-color: #F3F4F6; /* Gris clair au survol */
					color: #000000;
				}
				.menu-item.active {
					background-color: #000000; /* Fond noir quand actif */
					color: #FFFFFF; /* Texte blanc quand actif */
				}

				.square-radio {
					appearance: none;
					width: 18px;
					height: 18px;
					border: 2px solid #D1D5DB;
					background-color: white;
					border-radius: 2px;
					cursor: pointer;
					position: relative;
					margin-top: 2px;
				}

				.square-radio:checked {
					background-color: #000000;
					border-color: #000000;
				}

				.square-radio:checked::after {
					content: '✓';
					color: white;
					font-size: 12px;
					position: absolute;
					top: 0px;
					left: 2px;
				}

				.square-radio:hover {
					border-color: #6B7280;
				}

				#content-area .w-full {
					width: 100% !important;
				}

				#content-area .flex.justify-center {
					display: flex !important;
					justify-content: center !important;
					width: 100% !important;
				}
			</style>
	`;
}

// export async function UpdateInfosview() {
// 	return /* HTML */ `
// 		<div class="max-w-md mx-auto p-6 rounded-lg shadow-lg animate-fade-in">
// 			<h2 class="text-2xl font-bold mb-4 text-center text-purple-700">Modifier le compte</h2>
// 			<form id="register-form" class="space-y-4">
// 				<input
// 					autocomplete="off"
// 					type="text"
// 					name="login"
// 					id="login"
// 					placeholder="Login"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<input
// 					autocomplete="off"
// 					type="text"
// 					name="nickname"
// 					id="nickname"
// 					placeholder="Nickname"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<input
// 					autocomplete="off"
// 					type="email"
// 					name="email"
// 					id="mail"
// 					placeholder="Email"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<input
// 					type="password"
// 					name="password"
// 					id="password"
// 					placeholder="Mot de passe"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<input
// 					type="password"
// 					name="newPassword"
// 					id="newPassword"
// 					placeholder="Nouveau Mot de passe"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<input
// 					type="file"
// 					name="avatar"
// 					id="avatar"
// 					placeholder="inserer avatar"
// 					accept="image/jpeg, image/png, image/jgp, image/gif"
// 					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
// 				/>
// 				<button
// 					type="save updates"
// 					class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
// 				>
// 				Save updates
// 				</button>
// 			</form>
// 			<button
// 				id="defaultAvatars"
// 				class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
// 			>
// 			No avatar
// 			</button>
// 			<div
// 				id="error-message"
// 				class="w-full px-4 hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-20"
// 				style="display: none;"
// 				role="alert"
// 			></div>
// 		</div>
// 	`;
// }

export async function PongCanvas() {
	// gameCanvas
	return /* HTML */ `
		<div class="flex items-center justify-center w-screen h-screen bg-gray-900">
			<canvas id="gameCanvas" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"></canvas>
		</div>
	`;
}

export async function SnakeCanvas() {
	return /* HTML */ ` <canvas id="SnakeGameCanvas">snake</canvas> `;
}

export async function localPongCanvas() {
	return /* HTML */ `
		<div class="flex items-center justify-center w-screen h-screen bg-green-900">
			<canvas id="localgameCanvas" class="rounded-xl shadow-lg border-4 border-green-800 bg-black"></canvas>
		</div>
	`;
}

export async function localSnakeCanvas() {
	return /* HTML */ `
		<div class="flex items-center justify-center w-screen h-screen bg-gray-900">
			<canvas id="localSnakeGameCanvas" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"></canvas>
		</div>
	`;
}

export async function pongTournamentView() {
	return /* HTML */ `
		<div class="flex items-center justify-center w-screen h-screen bg-gray-900">
			<div id="formNb" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black p-8">
				<form id="playersForm">
					<div class="text-white">
						<h2 class="text-2xl font-bold mb-4">Tournoi - Saisie des joueurs</h2>
						<label for="nbPlayers" class="block mb-2">Nombre de joueurs :</label>
						<select
							id="nbPlayers"
							name="nbPlayers"
							class="bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded mb-6 w-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
						>
							<option value="4">4 players</option>
							<option value="8">8 players</option>
						</select>
					</div>

					<div id="playersZone" class="mb-6 text-white">
						<!-- Champs joueurs générés dynamiquement -->
					</div>

					<div>
						<button
							type="submit"
							class="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-150"
						>
							Valider la liste et démarrer
						</button>
					</div>
				</form>
			</div>
		</div>
	`;
}
