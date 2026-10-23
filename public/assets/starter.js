const button = document.querySelector('[data-copy-input]');
const input = document.querySelector('#starter-input code');
const status = document.querySelector('[data-copy-status]');
if (button && input && status && navigator.clipboard?.writeText) {
    button.hidden = false;
    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(input.textContent);
            status.textContent = 'Copied. Paste into the Actor’s JSON input.';
        } catch {
            status.textContent = 'Copy was unavailable. Select the JSON above or download the input file.';
        }
    });
}
