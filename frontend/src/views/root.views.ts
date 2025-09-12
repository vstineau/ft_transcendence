import { showProfileDetails } from '../user/popProfile'

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
        	<div class="grid gap-3 auto-rows-min mx-auto mt-36 justify-center" style="grid-template-columns: 320px 150px 280px 150px; max-width: 1000px;">

			<!-- Bloc Profil Utilisateur - prend 2 colonnes et 2 lignes changer la taille de base du bloc de profil -->
				<div class="row-span-2 bg-white rounded-xl shadow-lg p-4">
					<div class="flex items-start mb-14 ml-3 mt-2">
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

						<div class="flex space-x-6 ml-3 mt-6">
								<div class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition cursor-pointer" onclick="showProfileDetails()">View</div>
							<a href="/updateInfos" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-12 py-2 rounded-lg text-sm font-medium transition">Edit</a>
						</div>
					</div>

					<!-- Bloc Games played - 1 colonne, 1 ligne -->
					<div class="row-span-1 bg-white rounded-xl shadow-lg p-4">
						<a href="/statisticsSnake" class="text-left">
							<p class="font-montserrat text-black text-base" data-translate="dashboard.snakeStats">Snake stats</p>
							<p class="font-montserrat text-gray-400 text-sm mb-2" data-translate="dashboard.yourMaxSize">Your max size</p>
							<span class="text-4xl font-bold text-black" data-stat="max-size"></span>
						</a>
					</div>

					<!-- Bloc Pong Game - 3 colonnes, 2 lignes -->
					<div class="row-span-2 bg-white rounded-xl shadow-lg p-4" style="grid-column: 3 / 5">
						<div class="flex items-center justify-items-center mb-4">
							<h3 class="font-montserrat font-bold text-6xl" data-translate="dashboard.games">Games</h3>
						</div>

						<p class="font-montserrat font-medium text-gray-700 text-sm leading-5 mb-4">
							<span data-translate="games.pong.description">Pong is one of the first computer games that ever created, the goal is to defeat your opponent.</span><br><br>
							<span data-translate="games.snake.description">For Snake you must keep the snake from colliding with both other obstacles and itself.</span>
						</p>

						<div class="flex mt-4">
							<a
								href="/games"
								class="bg-black hover:bg-gray-800 text-white px-12 py-2 rounded-lg text-sm font-medium transition"
								data-translate="dashboard.play"
								>Play</a
							>
						</div>
					</div>

					<!-- Bloc Success rate - 1 colonne, 1 ligne -->
					<div class="row-span-1 bg-white rounded-xl shadow-lg p-4">
						<a href="/statisticsPong" class="text-left">
							<p class="font-montserrat text-black text-base">Pong stats</p>
							<p class="font-montserrat text-gray-400 text-sm mb-2">Your max speed</p>
							<span class="text-4xl font-bold text-black" data-stat="max-speed"></span>
						</a>
					</div>

					<!-- Bloc Let's talk - 4 colonnes, 1 ligne -->
					<div class="bg-white rounded-xl shadow-lg p-8" style="grid-column: 1 / 3; grid-row: 3">
						<div class="h-full flex flex-col justify-between">
							<h3 class="font-montserrat font-bold text-6xl mb-6">Let's talk</h3>
							<div id="recent-contacts-container" class="flex items-start space-x-6">
								<!-- Le contenu sera injecte dynamiquement -->
								<div class="text-center">
									<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl">
										Loading...
									</div>
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
									<span data-translate="dashboard.welcome">Welcome</span><br /><span class="text-gray-400" data-translate="dashboard.back">Back</span>
								</h3>
							</div>

							<div class="flex-1 flex gap-3">
								<!-- Language Selector -->
								<div class="flex-1 bg-white rounded-xl shadow-lg p-3 flex flex-col">
									<p class="font-montserrat text-base mb-2">Language</p>
									<select id="language-selector" class="flex-1 bg-transparent border-none outline-none cursor-pointer text-sm">
										<option value="en">ENGLISH</option>
										<option value="fr">FRANCAIS</option>
										<option value="es">ESPANOL</option>
									</select>
								</div>

								<!-- Light mode avec soleil centre -->
								<div
									id="dash-theme-toggle"
									class="flex-1 bg-white rounded-xl shadow-lg p-3 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
								>
									<p class="font-montserrat text-base mb-2" id="dash-theme-text" data-translate="dashboard.lightMode">Light mode</p>
									<div class="flex-1 flex items-center justify-center">
										<span class="text-6xl transition-transform hover:scale-110" id="dash-theme-icon">☼</span>
									</div>
								</div>

								<!-- Settings -->
								<a
									href="/updateInfos"
									class="flex-1 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg p-3 flex flex-col"
								>
									<p class="font-montserrat text-white text-base mb-2" data-translate="dashboard.settings">Settings</p>
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
			data-translate="nav.logout"
		>
			Logout
		</button>
	`;
}

export async function WelcomeView() {
	return /* HTML */ `
        <!-- Titre isolé - position absolue dès le départ -->
        <h1 id="main-title" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-black z-50 mb-24">
            FT<span class="text-blue-600">_</span>TRANSCENDENCE
        </h1>

        <!-- Section Hero - écran complet SANS le titre -->
        <div class="hero-section h-screen flex flex-col justify-center items-center bg-gray-100 relative">
            <div class="hero-content text-center pt-20">
                <p class="text-gray-600 text-lg mb-8 mt-8" data-translate="welcome.subtitle">Choose your adventure.</p>
            </div>

            <!-- Indicateur de scroll en bas -->
            <div class="scroll-indicator absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <span class="text-gray-500 text-sm block mb-2" data-translate="welcome.scroll">scroll</span>
                <div class="w-px h-8 bg-gray-200 mx-auto animate-pulse"></div>
            </div>
        </div>

        <!-- Section avec les blocs -->
        <div class="content-section min-h-screen bg-gray-100 py-16">
            <div class="max-w-4xl mx-auto px-8">
                <!-- Language Selector - en haut à droite -->
                <div class="flex justify-end mb-8">
                    <div class="bg-white rounded-lg shadow-sm p-2">
                        <select id="language-selector-welcome" class="bg-transparent border-none outline-none cursor-pointer text-sm">
                            <option value="en">🇺🇸 EN</option>
                            <option value="fr">🇫🇷 FR</option>
                            <option value="es">🇪🇸 ES</option>
                        </select>
                    </div>
                </div>

                <!-- Container des blocs en grid simple -->
                <div class="grid gap-4 mx-auto mt-36 justify-center" style="grid-template-columns: 200px 200px 200px; max-width: 600px;">

                    <!-- Bloc Sign up - Plus large -->
                    <a href="/login" class="bg-black hover:bg-gray-800 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col items-start justify-start transition-colors ">
                        <p class="font-montserrat font-medium text-white text-base mb-2" data-translate="auth.signIn">Sign in</p>
                    </a>

                    <!-- Bloc Light mode - Carré -->
                    <div id="theme-toggle" class="bg-white rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors">
                        <p class="font-montserrat font-medium text-base text-gray-600" id="theme-text" data-translate="dashboard.lightMode">Light mode</p>
                        <div class="flex-1 flex items-center justify-center">
                            <span class="text-3xl" id="theme-icon">☼</span>
                        </div>
                    </div>

                    <!-- Bloc Games - Carré -->
                    <a href="/games" class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors">
                        <p class="font-montserrat font-medium text-base text-gray-600" data-translate="nav.games">Games</p>
                        <div class="flex-1 flex items-center justify-center">
                            <span class="text-2xl">▶</span>
                        </div>
                    </a>
                </div>

                <!-- Bouton Create an account - Large en dessous -->
                <div class="mt-4" style="max-width: 616px; margin-left: auto; margin-right: auto;">
                    <a href="/register" class="font-montserrat block bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-medium text-lg transition-colors text-center" data-translate="auth.createAccount">
                        Create an account
                    </a>
                </div>
            </div>
        </div>
    </div>
`;
}

export async function PongChoice() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 id="dash-main-title" class="text-center text-4xl font-bold text-black mb-24">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<!-- Section avec les blocs -->
		<div class="content-section min-h-screen bg-gray-100 py-16">
			<div class="max-w-4xl mx-auto px-8">
				<!-- Container des blocs en grid simple -->
				<div
					class="grid gap-4 mx-auto mt-36 justify-center"
					style="grid-template-columns: 200px 200px 200px; max-width: 600px;"
				>
					<a
						href="/pong/matchmaking/localgame"
						class="bg-black hover:bg-gray-800 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col items-start justify-start transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Local</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🏠</span>
						</div>
					</a>

					<a
						href="/pong/matchmaking/game"
						class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Online</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🌏</span>
						</div>
					</a>

					<a
						href="/pong/tournament"
						class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Tournament</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🏆</span>
						</div>
					</a>

					<div class="mt-2 flex flex-col">
						<a href="/dashboard" class="text-gray-600 hover:text-black transition-colors">← Retour au Dashboard</a>
					</div>
				</div>
			</div>
		</div>
	`;
}

export async function SnakeChoice() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 id="dash-main-title" class="text-center text-4xl font-bold text-black mb-24">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<div class="content-section min-h-screen bg-gray-100 py-16">
			<div class="max-w-4xl mx-auto px-8">
				<!-- Container des blocs en grid simple -->
				<div
					class="grid gap-4 mx-auto mt-36 justify-center"
					style="grid-template-columns: 300px 300px; max-width: 600px;"
				>
					<a
						href="/snake/local"
						class="bg-black hover:bg-gray-800 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col items-start justify-start transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Local</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🏠</span>
						</div>
					</a>

					<!-- Bloc Games - Carré -->
					<a
						href="/snake"
						class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Online</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🌏</span>
						</div>
					</a>

					<div class="mt-2 flex flex-col">
						<a href="/dashboard" class="text-gray-600 hover:text-black transition-colors">← Retour au Dashboard</a>
					</div>
				</div>
			</div>
		</div>
	`;
}

export async function GamesView() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 id="dash-main-title" class="text-center text-4xl font-bold text-black mb-24">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<div class="content-section min-h-screen bg-gray-100 py-16">
			<div class="max-w-4xl mx-auto px-8">
				<!-- Container des blocs en grid simple -->
				<div
					class="grid gap-4 mx-auto mt-36 justify-center"
					style="grid-template-columns: 300px 300px; max-width: 600px;"
				>
					<a
						href="/pong-choice"
						class="bg-black hover:bg-gray-800 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col items-start justify-start transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Pong</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🏓</span>
						</div>
					</a>

					<!-- Bloc Games - Carré -->
					<a
						href="/snake-choice"
						class="bg-white hover:bg-gray-50 rounded-xl shadow-lg pt-2 pl-3 pr-6 pb-6 flex flex-col transition-colors"
					>
						<p class="font-montserrat font-medium text-base text-gray-600">Snake</p>
						<div class="flex-1 flex items-center justify-center">
							<span class="text-2xl">🐍</span>
						</div>
					</a>

					<div class="mt-2 flex flex-col">
						<a href="/dashboard" class="text-gray-600 hover:text-black transition-colors">← Retour au Dashboard</a>
					</div>
				</div>
			</div>
		</div>
	`;
}

function createStatsView(gameType: 'snake' | 'pong') {
    const config = {
        snake: {
            title: 'Snake stats',
            metrics: [
                { label: 'Classement', stat: 'classement' },
                { label: 'Max size', stat: 'max-size' },
                { label: 'Average size', stat: 'average-size' },
                { label: 'Eaten apples', stat: 'eaten-apples' }
            ],
            chartTitle: 'Length distribution',
            chartSubtitle: 'Your most common final sizes',
            timeTitle: 'Time game',
            timeSubtitle: 'Survival time analysis'
        },
        pong: {
            title: 'Pong stats',
            metrics: [
                { label: 'Classement', stat: 'classement' },
                { label: 'Max speed', stat: 'max-speed' },
                { label: 'Average speed', stat: 'average-speed' },
                { label: 'Total goals', stat: 'total-goals' }
            ],
            chartTitle: 'Ball speed distribution',
			chartSubtitle: 'Your most common final speeds',
			timeTitle: 'Match duration',
			timeSubtitle: 'Game duration analysis'
        }
    };

    const currentConfig = config[gameType];

    return /* HTML */ `
        <!-- Titre FT_TRANSCENDENCE en haut -->
        <div class="bg-gray-100 py-2">
            <h1 id="dash-main-title" class="text-center text-4xl font-bold text-black mb-24">
                FT<span class="text-blue-600">_</span>TRANSCENDENCE
            </h1>
        </div>

        <div class="content-section min-h-screen bg-gray-100 py-16">
            <div class="max-w-7xl mx-auto px-8">
                <div class="grid gap-6 auto-rows-min mx-auto mt-16" style="grid-template-columns: 280px 320px 280px; max-width: 1000px;">

                    <!-- Bloc My Profile -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="font-bold text-lg mb-4">My profil</h3>
                        <div class="flex items-center mb-4">
                            <div id="avatar-container" class="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden"></div>
                            <div class="ml-2 mt-12">
                                <h3 id="profile-display-name" class="font-montserrat font-bold text-lg">Loading...</h3>
                                <p id="profile-username" class="text-gray-600 text-sm mb-1">@loading...</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-4 text-xs mt-6">
                            ${currentConfig.metrics.map(metric => `
                                <div class="flex flex-col">
                                    <span class="text-gray-600">${metric.label}</span>
                                    <span class="font-semibold" data-stat="${metric.stat}">-</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

	                    <!-- Bloc Last Games -->
	                    <div class="bg-white rounded-xl shadow-lg p-6">
		                        <h3 class="font-bold text-lg mb-4">Last games</h3>
	                        <div id="last-games-content" class="space-y-3">
		                            <div class="flex flex-col items-center justify-center py-8 text-center">
	                                <p class="text-gray-500 text-sm">Loading...</p>
	                            </div>
	                        </div>
	                    </div>

	                    <!-- Bloc My Stats -->
	                    <div class="bg-white rounded-xl shadow-lg p-6">
	                        <h3 class="font-bold text-lg mb-4">My stats</h3>
	                        <p class="text-gray-800 text-sm">${currentConfig.chartTitle}</p>
                        <p class="text-gray-500 text-sm mb-4">${currentConfig.chartSubtitle}</p>
	                        <canvas id="scoreDistributionChart" width="250" height="180"></canvas>
	                    </div>

                    <!-- Bloc Global Ranking -->
                    <div class="bg-white rounded-xl shadow-lg p-6 col-span-2">
                        <h3 class="font-bold text-lg mb-4">Global Ranking</h3>
                        <div class="overflow-x-auto">
                            <table id="ranking-table" class="w-full text-sm">
                                <thead>
                                    <tr class="border-b">
                                        <th class="text-left py-2">Date</th>
                                        <th class="text-left py-2">Player</th>
                                        <th class="text-left py-2">Match wins</th>
                                        <th class="text-left py-2">Max size</th>
                                        <th class="text-left py-2">Best Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="5" class="py-8 text-center text-gray-500 text-sm">
                                            Loading rankings...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

	                    <!-- Bloc Time Game -->
	                    <div class="bg-white rounded-xl shadow-lg p-6">
	                        <h3 class="font-bold text-lg mb-4">${currentConfig.timeTitle}</h3>
	                        <p class="text-gray-500 text-sm mb-4">${currentConfig.timeSubtitle}</p>
	                        <canvas id="survivalTimeChart" width="250" height="180"></canvas>
	                    </div>

                    <div class="mt-2 flex flex-col">
                        <a href="../../../../../dashboard" class="text-gray-600 hover:text-black transition-colors">← Retour au Dashboard</a>
                    </div>
	                </div>
	            </div>
	        </div>
    `;
}

export async function StatsSnakeView() {
    return createStatsView('snake');
}

export async function StatsPongView() {
    return createStatsView('pong');
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
			<h1 class="text-center text-4xl font-bold text-black mb-24">
				FT<span class="text-blue-600">_</span>TRANSCENDENCE
			</h1>
		</div>

		<div class="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-4">
			<!--conteneur principal-->
			<div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">

                <!-- Language Selector en haut à droite du formulaire -->
                <div class="flex justify-end mb-4">
                    <select id="language-selector-login" class="bg-gray-100 border-none outline-none cursor-pointer text-sm p-2 rounded">
                        <option value="en">🇺🇸 EN</option>
                        <option value="fr">🇫🇷 FR</option>
                        <option value="es">🇪🇸 ES</option>
                    </select>
                </div>

                <!-- Titre -->
                <h2 class="text-2xl font-semibold text-center text-black mb-8" data-translate="auth.welcomeBack">Welcome back !</h2>
                <form id="login-form" class="space-y-4">

                    <!--login-->
                    <input
                        autocomplete="off"
                        type="login"
                        name="login"
                        id="login"
                        placeholder="login"
                        data-translate-placeholder="auth.login"
                        class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
                        required
                    />

                    <!-- Mot de passe -->
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        data-translate-placeholder="auth.password"
                        class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
                        required
                    />

                    <!-- Bouton S'inscrire -->
                    <div class="flex justify-center pt-4">
                        <button
                            type="submit"
                            class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            data-translate="auth.signIn">Sign in</button>
                    </div>
                </form>

                <!-- Lien vers connexion -->
                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-600">
                        <span data-translate="auth.noAccount">Don't have an account ?</span>
                        <a href="/register?/login" class="text-black hover:underline font-medium" data-translate="auth.signUp">Sign up</a>
                    </p>
                </div>

            </div>
	`;
}

export async function RegisterView() {
	return /* HTML */ `
		<!-- Titre FT_TRANSCENDENCE en haut -->
		<div class="bg-gray-100 py-2">
			<h1 class="text-center text-4xl font-bold text-black mb-8">FT<span class="text-blue-600">_</span>TRANSCENDENCE</h1>
		</div>
		<!-- Arrière-plan -->
		<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
			<!-- Container principal blanc centré -->
			<div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">

                <!-- Language Selector -->
                <div class="flex justify-end mb-4">
                    <select id="language-selector-register" class="bg-gray-100 border-none outline-none cursor-pointer text-sm p-2 rounded">
                        <option value="en">🇺🇸 EN</option>
                        <option value="fr">🇫🇷 FR</option>
                        <option value="es">🇪🇸 ES</option>
                    </select>
                </div>

				<!-- Titre -->
				<h2 class="text-2xl font-semibold text-center text-black mb-8" data-translate="auth.createAccount">Create an account</h2>

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
							data-translate-placeholder="auth.login"
							class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
							required
						/>
						<input
							autocomplete="off"
							type="text"
							name="nickname"
							id="nickname"
							placeholder="Nickname"
							data-translate-placeholder="auth.nickname"
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
						data-translate-placeholder="auth.email"
						class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
						required
					/>

					<!-- Mot de passe -->
					<input
						type="password"
						name="password"
						id="password"
						placeholder="Mot de passe"
						data-translate-placeholder="auth.password"
						class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
						required
					/>

					<!-- Upload de fichier -->
					<div class="space-y-2">
						<label class="block text-sm text-gray-600" data-translate="auth.profilePicture">Photo de profil (optionnel)</label>
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
							<label for="enable2fa" class="text-sm text-gray-700" data-translate="auth.enable2fa"> Enable dual authentication </label>
						</div>
					</div>

					<!-- Bouton S'inscrire -->
					<div class="flex justify-center">
						<button
							type="submit"
							class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
							data-translate="auth.signUp"
						>
							Sign up
						</button>
					</div>
				</form>

				<!-- infos private privacy -->
				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						<span data-translate="auth.agreeTerms">Signing up for a Ft_transcendence means you agree to the .</span>
						<a href="/privacy" class="text-black hover:underline font-medium" data-translate="auth.privacyPolicy">Privacy Policy</a>
						<span data-translate="auth.and"> and </span>
						<a href="/terms" class="text-black hover:underline font-medium" data-translate="auth.termsOfService">Terms of Service</a>.
					</p>
				</div>

				<!-- Lien vers connexion -->
				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						<span data-translate="auth.haveAccount">Have an account ?</span>
						<a href="/login" class="text-black hover:underline font-medium" data-translate="auth.signIn">Sign in</a>
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
		<h1 class="text-center text-4xl font-bold text-black mb-24">
			FT<span class="text-blue-600">_</span>TRANSCENDENCE
		</h1>
	</div>


	<div class="min-h-screen bg-gray-100 py-8 px-4">
		<div class="max-w-4xl mx-auto">

			<!-- Language Selector en haut à droite -->
			<div class="flex justify-end mb-8">
				<div class="bg-white rounded-lg shadow-sm p-2">
					<select id="language-selector-settings" class="bg-transparent border-none outline-none cursor-pointer text-sm">
						<option value="en">🇺🇸 EN</option>
						<option value="fr">🇫🇷 FR</option>
						<option value="es">🇪🇸 ES</option>
					</select>
				</div>
			</div>

			<!-- creer les onglets-->
			<div class="flex border-b border-gray-300 mb-8">
				<button class="tab-button active px-6 px-3 front-medium font-montserrat text-sm focus:outline-none border-b-2 transition-colors" data-tab="profil" data-translate="settings.profile">
					Profil
				</button>

				<button
					class="font-montserrat tab-button px-6 py-3 font-medium text-sm focus:outline-none border-b-2 transition-colors" data-tab="general" data-translate="settings.general">
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
								<p class="font-montserrat text-sm text-gray-500" data-translate="settings.profileSettings">Profil settings</p>
							</div>
						</div>
                    </div>

                        <!-- Menu latéral pour onglet Profil -->
                        <div id="profil-menu" class="tab-menu">
                            <div class="space-y-2">
                                <button class="font-montserrat menu-item active w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="change-password">
                                    <span class="w-5 h-5 mr-3 text-lg">ꗃ</span>
                                    <span data-translate="settings.changePassword">Change password</span>
                                </button>
                                <button class="font-montserrat menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center"  data-content="dual-authentication">
                                    <span class="w-5 h-5 mr-3 text-lg">✓</span>
                                    <span data-translate="settings.dualAuth">Dual authentication</span>
                                </button>
                                <button class="font-montserrat menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center"  data-content="profile-picture">
                                    <span class="w-5 h-5 mr-3">👤</span>
                                    <span data-translate="settings.profilePicture">Profile picture</span>
                                </button>
                            </div>
                        </div>

                        <!-- Menu latéral pour onglet General (caché par défaut) -->
                        <div id="general-menu" class="tab-menu hidden">
                            <div class="space-y-2">
                                <button class="menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="privacy-policy">
                                    <span class="w-5 h-5 mr-3 text-lg">⚖︎</span>
                                    <span data-translate="settings.privacyTerms">General privacy police<br>& terms of service</span>
                                </button>
                                <button class="menu-item w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center" data-content="delete">
                                    <span class="w-5 h-5 mr-3">🗑</span>
                                    <span data-translate="settings.deleteAccount">Delete your account</span>
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
							<a href="../../../../../dashboard" class="text-gray-600 hover:text-black transition-colors">
								<span data-translate="settings.backToDashboard">← Retour au Dashboard</span>
							</a>
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

// <div class="flex items-center justify-center w-screen h-screen bg-gray-900">
// 	<canvas id="gameCanvas" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"></canvas>
// </div>
export async function PongCanvas() {
	// gameCanvas
	return /* HTML */ `
		<div id="pongGame" class="flex items-center justify-center w-screen h-screen bg-gray-900">
			<!-- Colonne gauche : Joueur 1 -->
			<div id="playerOne" class="flex flex-col items-end mr-8">
				<div id="p1Name" class="font-bold text-xl text-white mb-2"></div>
				<img
					id="p1Avatar"
					class="w-40 h-40 rounded-xl mb-2 border-4 border-gray-700 object-cover"
					src=""
					alt=""
				/>
				<div class="flex flex-col items-end gap-2">
					<div id="p1keyup" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">
						W / ↑
					</div>
					<div id="p1keydown" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">
						S / ↓
					</div>
				</div>
			</div>

			<!-- Canvas central -->
			<canvas id="gameCanvas" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"></canvas>

			<!-- Colonne droite : Joueur 2 -->
			<div id="playerTwo" class="flex flex-col items-start ml-8">
				<div id="p2Name" class="font-bold text-xl text-white mb-2">...</div>
				<img
					id="p2Avatar"
					class="w-40 h-40 rounded-xl mb-2 border-4 border-gray-700 object-cover"
					src=""
					alt=""
				/>
				<div class="flex flex-col items-start gap-2">
					<div id="p2keyup" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">
						W / ↑
					</div>
					<div id="p2keydown" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">
						S / ↓
					</div>
				</div>
			</div>
		</div>
	`;
}

export async function SnakeCanvas() {
	return /* HTML */ `
		<div class="flex flex-col items-center justify-center w-screen h-screen bg-gray-900">
			<!-- Zone de texte (20%) -->
			<div class="flex items-center justify-center w-full h-[20vh] px-8">
				<div class="text-center text-white text-4xl font-bold">SNAKE GAME ONLINE</div>
			</div>

			<!-- Zone centrale avec blocs latéraux et canvas (80%) -->
			<div class="flex flex-row items-center justify-center w-full h-[80vh]">
				<!-- Bloc gauche : Photo carrée + nom joueur -->
				<div class="flex flex-col items-center justify-center h-[80vh] w-[20vh] mr-28">
					<img
						id="avatarJoueur1"
						src=""
						alt="Avatar joueur 1"
						class="w-40 h-40 object-cover border-4 border-gray-600 shadow-lg mb-8 rounded-xl"
					/>
					<input
						id="nomJoueur1"
						type="text"
						value="Joueur 1"
						class="bg-gray-700 text-white rounded px-4 py-2 text-2xl font-extrabold text-center w-full mb-2"
					/>
				</div>

				<!-- Canvas central -->
				<div class="flex items-center justify-center h-[80vh] w-[80vh]">
					<canvas
						id="SnakeGameCanvas"
						class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"
						width="640"
						height="640"
						style="width:80vh; height:80vh;"
					></canvas>
				</div>

				<!-- Bloc droit : Photo carrée + nom joueur -->
				<div class="flex flex-col items-center justify-center h-[80vh] w-[20vh] ml-28">
					<img
						id="avatarJoueur2"
						src=""
						alt="Avatar joueur 2"
						class="w-40 h-40 object-cover border-4 border-gray-600 shadow-lg mb-8 rounded-xl"
					/>
					<input
						id="nomJoueur2"
						type="text"
						value="Joueur 2"
						class="bg-gray-700 text-white rounded px-4 py-2 text-2xl font-extrabold text-center w-full mb-2"
					/>
				</div>

				<!-- Boutons fin de partie -->
				<div
					id="snakeGameEndButtons"
					class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
					style="display:none; pointer-events:auto;"
				>
					<div
						class="flex flex-row items-center justify-center gap-4 bg-gray-900 bg-opacity-30 p-8 rounded-xl shadow-2xl"
						style="position:relative; top:200px;"
					>
						<button
							id="replayBtn"
							class="bg-green-500 :bg-green-800 text-white px-15 py-8 rounded-lg text-[1vw] font-bold transition"
						>
							click or Press 'Enter' for replay
						</button>
						<button
							id="quitBtn"
							class="bg-red-500 hover:bg-red-800 text-white px-15 py-8 rounded-lg text-[1vw] font-bold transition"
						>
							click or press 'Escape' for quit
						</button>
					</div>
				</div>
			</div>
		</div>
	`;
}

//localgameCanvas
export async function localPongCanvas() {
	return /* HTML */ `
		<div class="flex items-center justify-center w-screen h-screen bg-gray-900">
			<!-- Colonne gauche : Joueur 1 -->
			<div id="playerOne" class="flex flex-col items-end mr-8">
				<div id="p1Name" class="font-bold text-xl text-white mb-4"></div>
				<div class="flex flex-col items-end gap-2">
					<div id="p1keyup" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">W</div>
					<div id="p1keydown" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">S</div>
				</div>
			</div>

			<!-- Canvas central -->
			<canvas id="localgameCanvas" class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"></canvas>

			<!-- Colonne droite : Joueur 2 -->
			<div id="playerTwo" class="flex flex-col items-start ml-8">
				<div id="p2Name" class="font-bold text-xl text-white mb-4"></div>
				<div class="flex flex-col items-start gap-2">
					<div id="p2keyup" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">↑</div>
					<div id="p2keydown" class="bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono">↓</div>
				</div>
			</div>
		</div>
	`;
}

export async function localSnakeCanvas() {
	return /* HTML */ `
		<div class="flex flex-col items-center justify-center w-screen h-screen bg-gray-900">
			<!-- Zone de texte (20%) -->
			<div class="flex items-center justify-center w-full h-[20vh] px-8">
				<div class="text-center text-white text-4xl font-bold">LOCAL SNAKE GAME</div>
			</div>

			<!-- Zone centrale avec blocs latéraux et canvas (80%) -->
			<div class="flex flex-row items-center justify-center w-full h-[80vh]">
				<!-- Bloc gauche pour WASD -->
				<div class="flex flex-col items-center justify-center h-[80vh] w-[10vh] mr-28">
					<div class="grid grid-cols-3 grid-rows-2 gap-2">
						<div></div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							W
						</div>
						<div></div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							A
						</div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							S
						</div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							D
						</div>
					</div>
				</div>

				<!-- Canvas central -->
				<div class="flex items-center justify-center h-[80vh] w-[80vh]">
					<canvas
						id="localSnakeGameCanvas"
						class="rounded-xl shadow-lg border-4 border-gray-800 bg-black"
						width="640"
						height="640"
						style="width:80vh; height:80vh;"
					></canvas>
				</div>

				<!-- Bloc droit pour flèches directionnelles -->
				<div class="flex flex-col items-center justify-center h-[80vh] w-[10vh] ml-28">
					<div class="grid grid-cols-3 grid-rows-2 gap-2">
						<div></div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							&#8593;
						</div>
						<div></div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							&#8592;
						</div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							&#8595;
						</div>
						<div class="bg-gray-700 text-white rounded flex items-center justify-center w-12 h-12 text-xl font-bold">
							&#8594;
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Boutons fin de partie -->
		<div
			id="snakeGameEndButtons"
			class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
			style="display:none; pointer-events:auto;"
		>
			<div
				class="flex flex-row items-center justify-center gap-4 bg-gray-900 bg-opacity-30 p-8 rounded-xl shadow-2xl"
				style="position:relative; top:200px;"
			>
				<button
					id="replayBtn"
					class="bg-green-500 :bg-green-800 text-white px-15 py-8 rounded-lg text-[1vw] font-bold transition"
				>
					click or Press 'Enter' for replay
				</button>
				<button
					id="quitBtn"
					class="bg-red-500 hover:bg-red-800 text-white px-15 py-8 rounded-lg text-[1vw] font-bold transition"
				>
					click or press 'Escape' for quit
				</button>
			</div>
		</div>
	`;
}

export async function pongTournamentView() {
	return /* HTML */ `
		<div class="flex min-h-screen min-w-full items-center justify-center bg-gray-900">
			<div id="formNb" class="min-h-screen min-w-full rounded-xl shadow-lg border-4 border-gray-800 bg-black p-8">
				<form id="playersForm">
					<div class="text-white">
						<h2 class="text-2xl font-bold mb-4">Pong Tournament</h2>
						<label for="nbPlayers" class="block mb-2">Number of Players :</label>
						<select
							id="nbPlayers"
							name="nbPlayers"
							class="bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded mb-4 w-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
						>
							<option value="4">4 players</option>
							<option value="8">8 players</option>
						</select>
					</div>
					<div>
						<button
							type="submit"
							class="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-150"
						>
							Choose Player's name
						</button>
					</div>
				</form>
			</div>
		</div>
	`;
}
