export async function displayError(errorMessage: string) {
	const errorDiv = document.getElementById('error-message');
	if (!errorDiv) {
		return;
	}
    if (errorMessage) {
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = "block";
    }
	else {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
	}
}
