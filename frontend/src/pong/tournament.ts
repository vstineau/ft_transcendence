// let canvas = document.getElementById('tournamentCanvas') as HTMLCanvasElement;
// let ctx = canvas.getContext('2d');

// function

let players: string [] = [];
function getPlayersName(nb: number) {
	const container = document.createElement('div'); // conteneur global
	// container.className = "mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10";
	for (let i = 1; i <= nb; i++) {
		console.log(`form ${i} created`);
		const input = document.createElement('input');
		input.type = 'text';
		input.name = `player${i}`;
		input.placeholder = `Nom du joueur ${i}`;
		input.required = true;
		input.className =
			'flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10';
		container.appendChild(input);
	}
	submitNamesButton(container);
	return container;
}

function submitNamesButton(container: HTMLDivElement) {
	const button = document.createElement('button');
	button.type = 'button'; // mettre 'submit' si tu veux soumettre le <form>
	button.textContent = 'Play !'; // IMPORTANT: texte visible du bouton
	button.className = 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white';
	button.addEventListener('click', () => {
		// Récupérer les noms et valider
		const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
		players = inputs.map(i => i.value.trim());
		const firstEmpty = inputs.find(i => i.value.trim().length === 0);

		if (firstEmpty) {
			alert('Veuillez renseigner tous les noms de joueurs.');
			firstEmpty.focus();
			return;
		}
		button.hidden = true;
		console.log(players);
		container.appendChild(button);
	});
}

export function tournament() {
	console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
	const playerForm = document.getElementById('playersForm') as HTMLFormElement;
	const form = document.getElementById('formNb') as HTMLFormElement;
	const nbPlayersSelect = document.getElementById('nbPlayers') as HTMLSelectElement;
	// let nbPlayers;

	playerForm.addEventListener('submit', e => {
		e.preventDefault(); // Empêche l'envoi classique du formulaire
		const nbPlayers = parseInt(nbPlayersSelect.value, 10); // Récupère et convertit la valeur sélectionnée
		// if (nbPlayers < 4 && nbPlayers > 8) return;
		console.log('Nombre de joueurs :', nbPlayers);
		// form.reset;
		const uiInput = getPlayersName(nbPlayers);
		// let button: HTMLDivElement = submitNamesButton(uiInput);
		// uiInput.appendChild(button);
		// playerForm.reset();
		playerForm.hidden = true;
		form.append(uiInput);
	});
}
