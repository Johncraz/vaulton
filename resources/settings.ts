
console.log("settings.ts loaded");

const vaultPinSetupForm = document.querySelector<HTMLFormElement>("#vault-pin-setup-form");
if (vaultPinSetupForm) {
    vaultPinSetupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Vault PIN form submitted");

        const formData = new FormData(vaultPinSetupForm);
        const pin = formData.get("pin");
        const confirmPin = formData.get("confirmPin");

        if (pin !== confirmPin) {
            alert("PINs do not match!");
            return;
        }

        if (typeof pin === "string" && (pin.length === 4 || pin.length === 6) && /^\d+$/.test(pin)) {
            // Here you would typically send the PIN to the server
            console.log("PIN set successfully:", pin);
            alert("Vault PIN set successfully!");
            vaultPinSetupForm.reset();
        } else {
            alert("PIN must be 4 or 6 digits.");
        }
    });
} else {
    console.warn("Vault PIN setup form not found");
}