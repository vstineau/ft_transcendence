import { displayError } from "../utils/error";
import { showQRCodeModal } from "../user/register";

export function init2FASetup(): void {
    const form = document.querySelector('#enable-2fa-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const checkbox = document.getElementById('settings-enable2fa') as HTMLInputElement;
        if (!checkbox.checked) {
            displayError('Please check the box to enable 2FA');
            return;
        }

        try {
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;

            const response = await fetch(`${protocol}//${host}:${port}/api/enable2fa`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({})
			});
            const result = await response.json();

            if (result.success) {
                showQRCodeModal(result.qrCode);
            } else {
                displayError(result.error || 'Failed to enable 2FA');
            }
        } catch (error) {
            console.log('2FA setup error:', error);
            displayError('Connection error. Please try again.');
        }
	});
}


