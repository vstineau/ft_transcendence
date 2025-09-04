
export async function displayLogout() {
	const logoutButton = document.getElementById('logout');
	if (!logoutButton) {
		return;
	}
    logoutButton.style.display = "block";
}



export async function readFileAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			// On retire le préfixe data:<mime>;base64,
			const base64 = (reader.result as string).split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
