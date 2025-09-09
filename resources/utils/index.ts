
// Utility function to debounce input validation
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Initializes password input toggle buttons inside the given root element.
 *
 * The following elements are required inside each toggle element:
 * - an `<input>` element with type "password" or "text"
 * - a `<button>` element containing two `<svg>` elements (order matters: open first, close second)
 *
 * Toggles the input type and displays/hides the icons accordingly.
 *
 * @param root - the root element to search for toggle elements (default: `document`)
 */
export const initPasswordToggles = (root: Document | HTMLElement = document) => {
    root.querySelectorAll<HTMLElement>("[data-password-with-toggle]").forEach(wrapper => {
        const input = wrapper.querySelector<HTMLInputElement>(
            "input[type='password'], input[type='text']"
        );
        const button = wrapper.querySelector<HTMLButtonElement>("button");

        if (!input || !button) return;

        // Find both icons inside button (order matters: open first, close second)
        const icons = button.querySelectorAll<SVGElement>("svg");

        button.addEventListener("click", () => {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";

            if (icons.length >= 2) {
                icons[0].style.display = isPassword ? "none" : "";
                icons[1].style.display = isPassword ? "" : "none";
            }
        });

        // Initialize icons (show open-eye first, hide closed-eye)
        if (icons.length >= 2) {
            icons[0].style.display = "";
            icons[1].style.display = "none";
        }
    });
}

// global event listener to handle button loading state
export const initFetchableButtonsGlobalState = () => {
    document
        .querySelectorAll("button[data-fetchable=true]") // select only fetchable buttons
        .forEach(button => {
            button.addEventListener("click", () => setButtonLoading(button as HTMLButtonElement));
        });
}


// Utility function to handle button loading state
export const setButtonLoading = (button: HTMLButtonElement) => {
    button.setAttribute("data-fetch-status", "loading");
    button.disabled = true;
}

export const setButtonIdle = (button: HTMLButtonElement) => {
    button.setAttribute("data-fetch-status", "idle");
    button.disabled = false;
}