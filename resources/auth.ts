import { ERROR_NAMES, type FailureResponse } from '@/utils/response.util';
import { createFormValidator, v } from './utils/vanilla-validator';
import { PATH } from '@/constants';
import { initPasswordToggles, setButtonIdle, setButtonLoading } from './utils';

// Initialize password toggle buttons
initPasswordToggles()

// ======================
// Types
// ======================
interface LoginFormData {
    email: string;
    password: string;
}

// ======================
// DOM Cache
// ======================
const loginForm = document.querySelector<HTMLFormElement>('#login-form');
const submitButton = document.querySelector<HTMLButtonElement>('button[type="submit"]');
const errorContainer = document.querySelector<HTMLUListElement>('ul#response-errors');

// ======================
// Error Rendering
// ======================
const showErrors = (messages: string[]) => {
    if (!errorContainer) {
        console.warn('Error container <ul id="response-errors"> not found.');
        return;
    }

    errorContainer.innerHTML = ''; // Clear old errors

    messages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        errorContainer.appendChild(li);
    });

    errorContainer.classList.remove('hidden');
};

const clearErrors = () => {
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.classList.add('hidden');
    }
};

// ======================
// Validator Setup
// ======================
const formValidator = () =>
    createFormValidator(
        {
            form: '#login-form',
            errorSummary: '#form-errors',
            validateOnSubmit: true,
            scrollToFirstError: true,
            preventSubmitIfInvalid: true,
        },
        {
            email: {
                selector: 'input[type="email"], input[name="email"]',
                validateOn: ['input', 'blur'],
                debounceMs: 500,
                validators: [v.required('Email is required.'), v.email()],
                a11y: true,
            },
            password: {
                selector: 'input[type="password"]',
                validateOn: ['input', 'blur'],
                debounceMs: 500,
                validators: [
                    v.minLength(8),
                    v.passwordRules({ upper: true, lower: true, digit: true, special: true }),
                ],
                a11y: true,
            },
        } as const,
        {
            onValidationChange: (isValid) => {
                if (submitButton) {
                    submitButton.disabled = !isValid;
                }
            },
        }
    );

// ======================
// API Call
// ======================
const loginRequest = async (data: LoginFormData): Promise<Response> => {
    return fetch(PATH.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

// ======================
// Submit Handler
// ======================

const handleSubmit = (fv: ReturnType<typeof formValidator>) => async (e: Event) => {
    e.preventDefault();
    clearErrors();

    setButtonLoading(submitButton!);
    const formData = fv.getData();

    try {
        const response = await loginRequest(formData);
        const json = await response.json();

        if (!response.ok) {
            setButtonIdle(submitButton!);
            const failure = json as FailureResponse<string[]>;
            console.info('Login error:', failure);

            if (failure.name === ERROR_NAMES.VALIDATION_ERROR) {
                showErrors(failure.data ?? []);
            } else {
                showErrors(['Invalid email or password.']);
            }
            return;
        }

        console.log('Login successful');
        window.location.replace(PATH.DASHBOARD.INDEX);
    } catch (err) {
        setButtonIdle(submitButton!);
        const msg = err instanceof Error ? err.message : 'Login failed, please try again.';
        showErrors([msg]);
    }
};

// ======================
// Init
// ======================
document.addEventListener('DOMContentLoaded', () => {
    if (!loginForm) {
        console.warn('Login form not found.');
        return;
    }

    const fv = formValidator();
    loginForm.addEventListener('submit', handleSubmit(fv));
});
