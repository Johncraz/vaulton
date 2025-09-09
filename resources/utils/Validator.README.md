# Vanilla Form Validator Documentation

## Overview

The Vanilla Form Validator is a lightweight, fully-typed TypeScript library for client-side form validation. It has **zero dependencies** and supports strong generics for form data and field names. Key features include:

- **Field-level and form-level (cross-field) validation**.
- **Sync and async validators** with optional debouncing.
- **Touched/dirty tracking** and validation on specific events (e.g., input, blur, change).
- **Pluggable error message rendering** for fields and summaries.
- **Accessibility (a11y) by default** (aria-invalid, aria-describedby).
- **Programmatic API** for validation, setting errors (e.g., from server), resetting, getting/setting data.
- **No frameworks required** – works with plain HTML forms.

This library is ideal for vanilla JavaScript/TypeScript projects needing robust form handling without bloat.

### Installation

Since it's a single-file library, copy the code into your project (e.g., `vanilla-validator.ts`). Import it as needed:

```typescript
import { createFormValidator, v } from './vanilla-validator';
```

Compile with TypeScript if using types.

## Basic Usage

Create a validator instance by passing form config and field configs. The `as const` assertion enables strong typing.

### Example: Simple Login Form

HTML:
```html
<form id="login-form">
  <label>Email: <input type="email" name="email"></label>
  <div id="email-error" class="hidden"></div>
  
  <label>Password: <input type="password" name="password"></label>
  <div id="password-error" class="hidden"></div>
  
  <div id="form-errors" class="hidden"></div>
  <button type="submit">Login</button>
</form>
```

TypeScript:
```typescript
interface LoginForm {
  email: string;
  password: string;
}

const fv = createFormValidator<LoginForm>(
  {
    form: '#login-form',
    errorSummary: '#form-errors',
    validateOnSubmit: true,
    preventSubmitIfInvalid: true,
    scrollToFirstError: true,
  },
  {
    email: {
      selector: 'input[name="email"]',
      validateOn: ['input', 'blur'],
      validators: [v.required('Email is required.'), v.email()],
      messageTarget: '#email-error',
      a11y: true,
    },
    password: {
      selector: 'input[name="password"]',
      validateOn: ['input', 'blur'],
      validators: [
        v.required('Password is required.'),
        v.minLength(8, 'Password must be at least 8 characters.'),
        v.passwordRules({ upper: true, lower: true, digit: true, special: true }),
      ],
      messageTarget: '#password-error',
      a11y: true,
    },
  } as const,
  {
    onValidationChange: (isValid) => {
      const submitBtn = document.querySelector('#login-form button[type="submit"]') as HTMLButtonElement;
      submitBtn.disabled = !isValid;
    },
  }
);

// Optional: Handle submit programmatically
document.querySelector('#login-form')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = await fv.validateForm();
  if (!ok) return;
  
  const data = fv.getData(); // { email: '...', password: '...' }
  // Send to server...
});
```

This setup validates on input/blur, prevents invalid submits, scrolls to errors, and disables the submit button when invalid.

## Configuration Options

### FormConfig<TForm>

Defines global form settings.

- `form: string | HTMLFormElement` (required): Selector or element for the form.
- `errorSummary?: string | HTMLElement | ((messages: string[], formEl: HTMLFormElement | null) => void)`: Where to render form-level errors. Can be a selector, element, or custom renderer function.
- `validateOnSubmit?: boolean` (default: true): Validate entire form on submit.
- `preventSubmitIfInvalid?: boolean` (default: true): Prevent form submission if invalid.
- `scrollToFirstError?: boolean` (default: false): Scroll to and focus the first invalid field on form validation failure.
- `formValidators?: FormValidatorFn<TForm>`: Function for cross-field validation (returns array of ValidationResult).
- `classes?: Partial<{ fieldInvalid: string; fieldValid: string; fieldTouched: string; }>`: Custom CSS classes (defaults: 'fv-invalid', 'fv-valid', 'fv-touched').

#### Example: Cross-Field Validation

Add to FormConfig:
```typescript
formValidators: ({ formData }) => {
  if (formData.password !== formData.confirmPassword) {
    return [{ valid: false, message: 'Passwords do not match.' }];
  }
  return [];
},
```

### FieldConfig<TForm, TValue>

Per-field settings.

- `selector: string | HTMLElement` (required): Selector or element for the field.
- `validators?: ValidatorFn<TForm, TValue>[]`: Array of validation functions.
- `validateOn?: Array<'input' | 'change' | 'blur'>`: Events to trigger validation (e.g., ['blur'] for on-blur only).
- `debounceMs?: number`: Debounce validation (ms) for performance with async validators.
- `getValue?: ValueGetter<TValue>`: Custom value getter (overrides default for inputs, textareas, selects).
- `setValue?: ValueSetter<TValue>`: Custom value setter.
- `messageTarget?: string | HTMLElement | ((args: MessageRenderArgs) => void)`: Where/how to render field errors. Selector, element, or custom function.
- `a11y?: boolean` (default: true): Enable aria-invalid and aria-describedby.

#### Example: Custom Value Handling (Checkbox)

```typescript
agree: {
  selector: 'input[type="checkbox"]',
  validators: [v.required('You must agree.')],
  getValue: (el) => (el as HTMLInputElement)?.checked ?? false,
  setValue: (el, v) => { if (el) (el as HTMLInputElement).checked = v; },
},
```

### Additional Options (Third Parameter)

- `onValidationChange?: (isValid: boolean) => void`: Callback fired when form validity changes (e.g., enable/disable submit button).

## Programmatic API

The returned `CreatedFormValidator<TForm>` object provides:

- `formEl: HTMLFormElement | null` (readonly): The form element.
- `fields: Readonly<Record<keyof TForm & string, HTMLElement | null>>` (readonly): Field elements.
- `validateField(name: keyof TForm & string): Promise<boolean>`: Validate a single field.
- `validateForm(): Promise<boolean>`: Validate entire form (including form-level validators).
- `setErrors(fieldErrors: Partial<Record<keyof TForm & string, string[]>>, formErrors?: string[]): void`: Set errors (e.g., from server response).
- `clearErrors(): void`: Clear all errors.
- `getData(): TForm`: Get current form data.
- `setValue<K extends keyof TForm & string>(name: K, value: TForm[K]): void`: Set a field value.
- `touch(name: keyof TForm & string): void`: Mark field as touched (applies classes).
- `reset(): void`: Reset states and errors.
- `destroy(): void`: Remove event listeners.

#### Example: Server-Side Errors

After a fetch:
```typescript
if (!res.ok) {
  const json = await res.json();
  fv.setErrors(json.fieldErrors || {}, json.formErrors || []);
}
```

#### Example: Async Validator

Custom async validator:
```typescript
const asyncEmailCheck: ValidatorFn<LoginForm, string> = async ({ value }) => {
  const res = await fetch(`/check-email?email=${encodeURIComponent(value)}`);
  const { available } = await res.json();
  return available ? { valid: true } : { valid: false, message: 'Email taken.' };
};
```

Add to field: `validators: [..., asyncEmailCheck], debounceMs: 300`.

## Built-in Validators (v.*)

All return `ValidatorFn<TForm, TValue>`. Most skip validation if value is empty (use `v.required()` for that).

- `v.required(message?: string)`: Checks for non-empty value (strings trimmed, arrays non-empty).
  - Example: `v.required('Required.')` – Fails on '', null, [], undefined.

- `v.pattern(regex: RegExp, message?: string)`: Matches string against regex.
  - Example: `v.pattern(/^\d{5}$/, 'Invalid ZIP.')`.

- `v.email(message?: string)`: Validates email format (RFC 5322-lite).
  - Example: `v.email()` – Passes 'user@example.com', fails 'invalid@'.

- `v.minLength(len: number, message?: string)`: String length >= len.
  - Example: `v.minLength(3)` – Fails on 'ab'.

- `v.maxLength(len: number, message?: string)`: String length <= len.
  - Example: `v.maxLength(10)` – Fails on 'too long string'.

- `v.sameAs<K extends keyof TForm & string>(other: K, message?: string)`: Value equals another field's value.
  - Example: `v.sameAs('password', 'Must match password.')` for confirmPassword field.

- `v.numberRange(min?: number, max?: number, message?: string)`: Number within range (skips NaN/undefined).
  - Example: `v.numberRange(18, 99)` – Fails on 17 or 100.

- `v.passwordRules(opts: { upper?: boolean; lower?: boolean; digit?: boolean; special?: boolean; minUnique?: number })`: Checks password complexity.
  - Example: `v.passwordRules({ upper: true, digit: true })` – Fails if no uppercase or digit.

- `v.custom(fn: ValidatorFn<TForm, TValue>)`: Wraps a custom function.
  - Example: `v.custom(({ value }) => value > 0 ? { valid: true } : { valid: false, message: 'Positive only.' })`.

## Error Rendering

### Default Renderers

- Field errors: Inject HTML into `messageTarget` (hides if no errors).
- Summary: Inject into `errorSummary` (supports UL/OL for lists).

### Custom Renderers

For fields:
```typescript
messageTarget: ({ messages, name }) => {
  const el = document.getElementById(`${name}-error`);
  if (el) el.innerHTML = messages.map(m => `<span>${m}</span>`).join('');
},
```

For summary:
```typescript
errorSummary: (messages) => {
  alert(messages.join('\n')); // Custom alert instead of DOM
},
```

## Advanced Cases

### Debouncing Async Validation

For expensive checks:
```typescript
email: {
  ...,
  debounceMs: 500, // Wait 500ms after last event
},
```

### Custom Elements (Non-Standard Inputs)

Use `getValue`/`setValue` for custom components:
```typescript
custom: {
  selector: '#my-custom',
  getValue: (el) => el?.dataset.value ?? '',
  setValue: (el, v) => { if (el) el.dataset.value = v; },
},
```

### Form-Level Only Validation

Set `validateOnSubmit: true`, no `validateOn` per field – validates only on submit.

### No Auto-Prevent Submit

Set `preventSubmitIfInvalid: false` – call `validateForm()` manually in submit handler.

### Tracking Dirty/Touched

States are internal but exposed via classes. Use `touch()` to manually mark touched.

### Destruction

Call `fv.destroy()` when removing the form (e.g., SPA navigation) to clean up listeners.

### Edge Cases

- **Empty Form**: No fields – `validateForm()` returns true.
- **Missing Elements**: Selector not found – field ignored, logs no errors.
- **Async Errors**: Handles promises; shows errors after resolution.
- **Multiple Validators**: Stops on first failure? No – runs all, collects all messages.
- **Accessibility Off**: Set `a11y: false` per field to skip aria attributes.
- **Large Forms**: Debounce + event selection optimizes performance.

## Troubleshooting

- **No Validation Triggers**: Check `validateOn` arrays and event bindings.
- **Errors Not Showing**: Ensure `messageTarget`/`errorSummary` exist and are visible.
- **Type Errors**: Use `as const` on configs for generics.
- **Custom Renderers**: Debug by logging in renderer functions.

This covers all core features and edge cases. For contributions or issues, adapt as needed since it's open-source inspired.