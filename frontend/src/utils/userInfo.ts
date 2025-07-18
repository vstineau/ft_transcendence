
export async function displayLogout() {
	const logoutButton = document.getElementById('logout');
	if (!logoutButton) {
		return;
	}
    logoutButton.style.display = "block";
}
