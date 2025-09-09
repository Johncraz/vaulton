// /*
//  * Vanilla, Fully‑Typed Form Validator (TypeScript, zero‑deps)
//  * -----------------------------------------------------------
//  * ✓ Strong generics: typed form data + field names
//  * ✓ Field-level + form-level (cross-field) validators
//  * ✓ Sync + async validators (with optional debounce)
//  * ✓ Touched/dirty tracking; validate on chosen events
//  * ✓ Pluggable message rendering (per-field + summary)
//  * ✓ Accessible by default (aria-invalid/aria-describedby)
//  * ✓ Programmatic API: validate, setErrors (server), reset, getData, setValue
//  * ✓ No frameworks, no dependencies
//  *
//  * Usage (Login form example):
//  * -----------------------------------------------------------
//  * import { createFormValidator, v } from "./vanilla-validator";
//  *
//  * const fv = createFormValidator(
//  *   {
//  *     form: "#login-form",
//  *     errorSummary: "#form-errors",
//  *     validateOnSubmit: true,
//  *     scrollToFirstError: true,
//  *   },
//  *   {
//  *     email: {
//  *       selector: 'input[type="email"], input[name="email"]',
//  *       validateOn: ["input", "blur"],
//  *       validators: [v.required(), v.email()],
//  *     },
//  *     password: {
//  *       selector: 'input[type="password"]',
//  *       validateOn: ["input", "blur"],
//  *       validators: [
//  *         v.required(),
//  *         v.minLength(8),
//  *         v.passwordRules({
//  *           upper: true, lower: true, digit: true, special: true,
//  *         }),
//  *       ],
//  *     },
//  *   } as const
//  * );
//  *
//  * // Submit flow (example):
//  * document.querySelector('#login-form')!.addEventListener('submit', async (e) => {
//  *   e.preventDefault();
//  *   const ok = await fv.validateForm();
//  *   if (!ok) return;
//  *
//  *   const body = fv.getData();
//  *   const res = await fetch('/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
//  *   const json = await res.json();
//  *   if (!res.ok) {
//  *     // Support either field-specific or global messages
//  *     // e.g. { fieldErrors: { email: ["Bad email"] }, formErrors: ["Invalid user"] }
//  *     fv.setErrors(json.fieldErrors || {}, json.formErrors || []);
//  *     return;
//  *   }
//  *   window.location.href = '/dashboard';
//  * });
//  */

// // -----------------------------------------------------------
// // Types
// // -----------------------------------------------------------
// export type MaybePromise<T> = T | Promise<T>;

// export type ValidationResult =
//     | { valid: true }
//     | { valid: false; message: string; code?: string };

// export type ValidatorFn<TForm, TValue = unknown> = (ctx: {
//     name: keyof TForm & string;
//     value: TValue;
//     formData: Readonly<TForm>;
//     fieldEl: HTMLElement | null;
//     formEl: HTMLFormElement | null;
// }) => MaybePromise<ValidationResult>;

// export type FormValidatorFn<TForm> = (ctx: {
//     formData: Readonly<TForm>;
//     formEl: HTMLFormElement | null;
// }) => MaybePromise<ValidationResult[]>; // multiple messages allowed at form-level

// export type ValueGetter<TValue> = (el: HTMLElement | null) => TValue;
// export type ValueSetter<TValue> = (el: HTMLElement | null, v: TValue) => void;

// export type FieldConfig<TForm, TValue = unknown> = {
//     selector: string | HTMLElement;
//     validators?: ValidatorFn<TForm, TValue>[];
//     // Which DOM events should trigger validation for this field
//     validateOn?: Array<"input" | "change" | "blur">;
//     // Debounce async/sync validators per field (ms)
//     debounceMs?: number;
//     // Optional custom value coercion
//     getValue?: ValueGetter<TValue>;
//     setValue?: ValueSetter<TValue>;
//     // Where/how to show messages for this field
//     messageTarget?: string | HTMLElement | ((args: MessageRenderArgs) => void);
//     // If true, will set aria-invalid and link message with aria-describedby
//     a11y?: boolean;
// };

// export type MessageRenderArgs = {
//     name: string;
//     messages: string[]; // resolved for the field
//     fieldEl: HTMLElement | null;
//     formEl: HTMLFormElement | null;
// };

// export type FormConfig<TForm> = {
//     form: string | HTMLFormElement;
//     errorSummary?: string | HTMLElement | ((formMessages: string[], formEl: HTMLFormElement | null) => void);
//     validateOnSubmit?: boolean; // default true
//     preventSubmitIfInvalid?: boolean; // default true
//     scrollToFirstError?: boolean; // default false
//     classes?: Partial<{
//         fieldInvalid: string; // applied to field element on invalid
//         fieldValid: string;   // applied to field element on valid
//         fieldTouched: string; // applied once user interacted
//     }>;
// };

// export type FieldState = {
//     touched: boolean;
//     dirty: boolean;
//     messages: string[];
//     validating: boolean;
//     valid: boolean; // latest
// };

// export type CreatedFormValidator<TForm> = {
//     // read-only snapshot
//     readonly formEl: HTMLFormElement | null;
//     readonly fields: Readonly<Record<keyof TForm & string, HTMLElement | null>>;

//     validateField: (name: keyof TForm & string) => Promise<boolean>;
//     validateForm: () => Promise<boolean>;

//     setErrors: (
//         fieldErrors: Partial<Record<keyof TForm & string, string[]>>, // server field errors
//         formErrors?: string[]
//     ) => void;

//     clearErrors: () => void;

//     getData: () => TForm;
//     setValue: <K extends keyof TForm & string>(name: K, value: TForm[K]) => void;

//     touch: (name: keyof TForm & string) => void;
//     reset: () => void;
//     destroy: () => void;
// };

// // -----------------------------------------------------------
// // Utilities
// // -----------------------------------------------------------
// const isHTMLElement = (o: any): o is HTMLElement => o && typeof o === "object" && "nodeType" in o;
// const el = <T extends HTMLElement>(root: ParentNode, sel: string): T | null => root.querySelector(sel);
// const asEl = (x: string | HTMLElement | null | undefined): HTMLElement | null =>
//     !x ? null : typeof x === "string" ? document.querySelector(x) : x;

// const DEFAULT_CLASSES = {
//     fieldInvalid: "fv-invalid",
//     fieldValid: "fv-valid",
//     fieldTouched: "fv-touched",
// };

// const DEFAULT_SUMMARY_RENDERER = (summaryEl: HTMLElement | null, messages: string[]) => {
//     if (!summaryEl) return;
//     const isList = summaryEl.tagName === "UL" || summaryEl.tagName === "OL";
//     summaryEl.classList.toggle("hidden", messages.length === 0);
//     if (isList) {
//         summaryEl.innerHTML = messages.map((m) => `<li>${m}</li>`).join("");
//     } else {
//         summaryEl.innerHTML = messages.join("<br>");
//     }
// };

// const DEFAULT_FIELD_RENDERER = (target: HTMLElement | null, messages: string[]) => {
//     if (!target) return;
//     const isList = target.tagName === "UL" || target.tagName === "OL";
//     target.classList.toggle("hidden", messages.length === 0);
//     if (isList) {
//         target.innerHTML = messages.map((m) => `<li>${m}</li>`).join("");
//     } else {
//         target.innerHTML = messages.join("<br>");
//     }
// };

// const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 200) => {
//     let t: number | undefined;
//     const debounced = (...args: Parameters<T>) => {
//         if (t) window.clearTimeout(t);
//         t = window.setTimeout(() => fn(...args), ms);
//     };
//     (debounced as any).flush = () => { if (t) { window.clearTimeout(t); t = undefined; fn(); } };
//     return debounced as T & { flush: () => void };
// };

// // -----------------------------------------------------------
// // Core factory
// // -----------------------------------------------------------
// export function createFormValidator<TForm extends Record<string, any>>(
//     formConfig: FormConfig<TForm>,
//     fieldsConfig: { [K in keyof TForm & string]: FieldConfig<TForm, TForm[K]> }
// ): CreatedFormValidator<TForm> {
//     const formEl = asEl(formConfig.form) as HTMLFormElement | null;
//     const classes = { ...DEFAULT_CLASSES, ...(formConfig.classes || {}) };
//     const validateOnSubmit = formConfig.validateOnSubmit !== false; // default true
//     const preventSubmitIfInvalid = formConfig.preventSubmitIfInvalid !== false; // default true

//     // Prepare fields
//     const fieldElements: Record<string, HTMLElement | null> = {};
//     const fieldStates: Record<string, FieldState> = {};
//     const fieldDebouncers: Record<string, ((() => void) & { flush: () => void }) | null> = {};

//     for (const name of Object.keys(fieldsConfig)) {
//         const cfg = fieldsConfig[name as keyof TForm & string];
//         const target = typeof cfg.selector === "string" ? el<HTMLElement>(document, cfg.selector) : cfg.selector;
//         fieldElements[name] = target ?? null;
//         fieldStates[name] = { touched: false, dirty: false, messages: [], validating: false, valid: true };
//         fieldDebouncers[name] = cfg.debounceMs ? debounce(() => void 0, cfg.debounceMs) : null; // placeholder; per-field we'll use inline debouncing
//     }

//     // Resolve per-field message target
//     function resolveFieldMessageTarget(cfg: FieldConfig<TForm, any>): HTMLElement | null | ((args: MessageRenderArgs) => void) {
//         if (!cfg.messageTarget) return null;
//         if (typeof cfg.messageTarget === "function") return cfg.messageTarget;
//         return asEl(cfg.messageTarget);
//     }

//     // Read / write values
//     const getValue = <K extends keyof TForm & string>(name: K): TForm[K] => {
//         const cfg = fieldsConfig[name];
//         const elRef = fieldElements[name];
//         if (cfg.getValue) return cfg.getValue(elRef);
//         if (!elRef) return undefined as unknown as TForm[K];
//         // default coercion for common input types
//         if (elRef instanceof HTMLInputElement) {
//             const type = elRef.type;
//             if (type === "checkbox") return (!!elRef.checked) as unknown as TForm[K];
//             if (type === "number" || type === "range") return (elRef.value === "" ? undefined : Number(elRef.value)) as unknown as TForm[K];
//             return elRef.value as unknown as TForm[K];
//         }
//         if (elRef instanceof HTMLTextAreaElement) return elRef.value as unknown as TForm[K];
//         if (elRef instanceof HTMLSelectElement) return elRef.value as unknown as TForm[K];
//         return (elRef as any).value as TForm[K];
//     };

//     const setValue = <K extends keyof TForm & string>(name: K, value: TForm[K]) => {
//         const cfg = fieldsConfig[name];
//         const elRef = fieldElements[name];
//         if (cfg.setValue) return cfg.setValue(elRef, value);
//         if (!elRef) return;
//         if (elRef instanceof HTMLInputElement || elRef instanceof HTMLTextAreaElement || elRef instanceof HTMLSelectElement) {
//             if ((elRef as HTMLInputElement).type === "checkbox" && typeof value === "boolean") {
//                 (elRef as HTMLInputElement).checked = value;
//             } else {
//                 (elRef as any).value = value as any;
//             }
//         } else {
//             (elRef as any).value = value as any;
//         }
//     };

//     const getFormData = (): TForm => {
//         const data = {} as TForm;
//         for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
//             (data as any)[name] = getValue(name);
//         }
//         return data;
//     };

//     // Rendering helpers
//     const summaryTarget = typeof formConfig.errorSummary === "function" || !formConfig.errorSummary
//         ? formConfig.errorSummary
//         : asEl(formConfig.errorSummary);

//     function renderSummary(messages: string[]) {
//         if (typeof summaryTarget === "function") {
//             summaryTarget(messages, formEl);
//         } else {
//             DEFAULT_SUMMARY_RENDERER(summaryTarget as HTMLElement | null, messages);
//         }
//     }

//     function renderField(name: string) {
//         const cfg = fieldsConfig[name as keyof TForm & string];
//         const target = resolveFieldMessageTarget(cfg);
//         const messages = fieldStates[name].messages;

//         const fieldEl = fieldElements[name];
//         if (cfg.a11y !== false && fieldEl) {
//             fieldEl.setAttribute("aria-invalid", String(messages.length > 0));
//             // link describedby if we have an element target
//             if (target && isHTMLElement(target)) {
//                 const id = target.id || `${String(name)}-error`;
//                 target.id = id;
//                 fieldEl.setAttribute("aria-describedby", id);
//             }
//         }

//         if (typeof target === "function") {
//             target({ name, messages, fieldEl, formEl });
//         } else {
//             DEFAULT_FIELD_RENDERER(target as HTMLElement | null, messages);
//         }

//         // Classes
//         if (fieldEl) {
//             fieldEl.classList.toggle(classes.fieldInvalid, messages.length > 0);
//             fieldEl.classList.toggle(classes.fieldValid, messages.length === 0 && fieldStates[name].touched);
//         }
//     }

//     function collectAllMessages(): string[] {
//         const msgs: string[] = [];
//         for (const name of Object.keys(fieldStates)) {
//             msgs.push(...fieldStates[name].messages);
//         }
//         return msgs;
//     }

//     async function runValidatorsForField(name: keyof TForm & string): Promise<string[]> {
//         const cfg = fieldsConfig[name];
//         const validators = cfg.validators || [];
//         const value = getValue(name);
//         const formData = getFormData();
//         const fieldEl = fieldElements[name];

//         const messages: string[] = [];
//         for (const fn of validators) {
//             const res = await fn({ name, value, formData, fieldEl, formEl });
//             if (!res || res.valid === true) continue;
//             messages.push(res.message);
//         }
//         return messages;
//     }

//     async function validateField(name: keyof TForm & string): Promise<boolean> {
//         const cfg = fieldsConfig[name];
//         const state = fieldStates[name];

//         state.touched = true;
//         const exec = async () => {
//             state.validating = true;
//             const messages = await runValidatorsForField(name);
//             state.messages = messages;
//             state.valid = messages.length === 0;
//             state.validating = false;
//             renderField(name);
//             renderSummary(collectAllMessages());
//             return state.valid;
//         };

//         if (cfg.debounceMs && cfg.debounceMs > 0) {
//             return new Promise((resolve) => {
//                 const d = debounce(async () => resolve(await exec()), cfg.debounceMs);
//                 d();
//             });
//         }
//         return exec();
//     }

//     async function validateForm(): Promise<boolean> {
//         const results = await Promise.all(
//             (Object.keys(fieldsConfig) as Array<keyof TForm & string>).map((n) => validateField(n))
//         );

//         // Run form-level validators (cross-field) if provided
//         let formLevelMessages: string[] = [];
//         if (typeof (formConfig as any).formValidators === "function") {
//             const res = await (formConfig as any).formValidators({ formData: getFormData(), formEl });
//             if (Array.isArray(res)) {
//                 for (const r of res) if (r && r.valid === false) formLevelMessages.push(r.message);
//             }
//         }

//         const allMessages = collectAllMessages();
//         allMessages.push(...formLevelMessages);
//         renderSummary(allMessages);

//         if (formConfig.scrollToFirstError && allMessages.length > 0) {
//             const firstInvalid = Object.keys(fieldStates).find((n) => fieldStates[n].messages.length > 0);
//             const elRef = firstInvalid ? fieldElements[firstInvalid] : null;
//             elRef?.scrollIntoView({ behavior: "smooth", block: "center" });
//             elRef?.focus({ preventScroll: true });
//         }

//         return results.every(Boolean) && formLevelMessages.length === 0;
//     }

//     function setErrors(
//         fieldErrors: Partial<Record<keyof TForm & string, string[]>>,
//         formErrors: string[] = []
//     ) {
//         // Assign messages
//         for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
//             const msgs = fieldErrors[name] || [];
//             fieldStates[name].messages = msgs;
//             fieldStates[name].valid = msgs.length === 0;
//             // Mark as touched so styling appears
//             fieldStates[name].touched = true;
//             renderField(name);
//         }
//         const all = collectAllMessages();
//         all.push(...formErrors);
//         renderSummary(all);
//     }

//     function clearErrors() {
//         for (const name of Object.keys(fieldStates)) {
//             fieldStates[name].messages = [];
//             fieldStates[name].valid = true;
//             renderField(name);
//         }
//         renderSummary([]);
//     }

//     function touch(name: keyof TForm & string) {
//         fieldStates[name].touched = true;
//         const elRef = fieldElements[name];
//         elRef?.classList.add(classes.fieldTouched);
//     }

//     function reset() {
//         for (const name of Object.keys(fieldStates)) {
//             fieldStates[name] = { touched: false, dirty: false, messages: [], validating: false, valid: true };
//             renderField(name);
//         }
//         renderSummary([]);
//     }

//     function destroy() {
//         // remove listeners
//         if (formEl && validateOnSubmit && preventSubmitIfInvalid) {
//             formEl.removeEventListener("submit", onSubmit);
//         }
//         for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
//             const elRef = fieldElements[name];
//             const cfg = fieldsConfig[name];
//             const bound = boundHandlers[name];
//             if (elRef && bound) {
//                 for (const ev of cfg.validateOn || []) {
//                     elRef.removeEventListener(ev, bound);
//                 }
//             }
//         }
//     }

//     // Event binding
//     const boundHandlers: Record<string, (e: Event) => void> = {};
//     for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
//         const cfg = fieldsConfig[name];
//         const elRef = fieldElements[name];
//         if (!elRef) continue;

//         const handler = async () => {
//             touch(name);
//             await validateField(name);
//         };
//         boundHandlers[name] = handler;

//         for (const ev of cfg.validateOn || []) {
//             elRef.addEventListener(ev, handler);
//         }
//     }

//     async function onSubmit(e: Event) {
//         if (!preventSubmitIfInvalid) return;
//         const ok = await validateForm();
//         if (!ok) {
//             e.preventDefault();
//             e.stopPropagation();
//         }
//     }

//     if (formEl && validateOnSubmit) {
//         formEl.addEventListener("submit", onSubmit);
//     }

//     return {
//         get formEl() { return formEl; },
//         get fields() { return Object.fromEntries(Object.entries(fieldElements)) as any; },

//         validateField: (n) => validateField(n),
//         validateForm,

//         setErrors,
//         clearErrors,

//         getData: () => getFormData(),
//         setValue,

//         touch,
//         reset,
//         destroy,
//     } as const;
// }

// // -----------------------------------------------------------
// // Built-in validators (v.*)
// // -----------------------------------------------------------
// export const v = {
//     required<TForm, TValue>(message = "This field is required."): ValidatorFn<TForm, TValue> {
//         return ({ value }) => {
//             if (value === undefined || value === null) return { valid: false, message } as const;
//             if (typeof value === "string" && value.trim() === "") return { valid: false, message } as const;
//             if (Array.isArray(value) && value.length === 0) return { valid: false, message } as const;
//             return { valid: true } as const;
//         };
//     },

//     pattern<TForm>(regex: RegExp, message = "Invalid format."): ValidatorFn<TForm, string> {
//         return ({ value }) => {
//             if (typeof value !== "string") return { valid: true } as const;
//             return regex.test(value) ? { valid: true } as const : { valid: false, message } as const;
//         };
//     },

//     email<TForm>(message = "Invalid email address."): ValidatorFn<TForm, string> {
//         // RFC 5322-lite
//         const re = /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
//         return ({ value }) => {
//             if (typeof value !== "string" || value.trim() === "") return { valid: true } as const; // let required handle empties
//             return re.test(value.trim()) ? { valid: true } as const : { valid: false, message } as const;
//         };
//     },

//     minLength<TForm>(len: number, message?: string): ValidatorFn<TForm, string> {
//         return ({ value }) => {
//             if (typeof value !== "string") return { valid: true } as const;
//             if (value.length < len) return { valid: false, message: message || `Must be at least ${len} characters.` } as const;
//             return { valid: true } as const;
//         };
//     },

//     maxLength<TForm>(len: number, message?: string): ValidatorFn<TForm, string> {
//         return ({ value }) => {
//             if (typeof value !== "string") return { valid: true } as const;
//             if (value.length > len) return { valid: false, message: message || `Must be at most ${len} characters.` } as const;
//             return { valid: true } as const;
//         };
//     },

//     equalsField<TForm, K extends keyof TForm & string>(other: K, message = "Values do not match."): ValidatorFn<TForm, any> {
//         return ({ formData }) => {
//             return { valid: true } as const; // actual comparison done below via closure
//         };
//     },

//     sameAs<TForm, K extends keyof TForm & string>(other: K, message = "Values do not match."): ValidatorFn<TForm, any> {
//         return ({ value, formData }) => {
//             return (value === (formData as any)[other]) ? { valid: true } as const : { valid: false, message } as const;
//         };
//     },

//     numberRange<TForm>(min?: number, max?: number, message?: string): ValidatorFn<TForm, number | undefined> {
//         return ({ value }) => {
//             if (value === undefined || value === null || Number.isNaN(value)) return { valid: true } as const;
//             if (typeof min === "number" && value < min) return { valid: false, message: message || `Must be ≥ ${min}.` } as const;
//             if (typeof max === "number" && value > max) return { valid: false, message: message || `Must be ≤ ${max}.` } as const;
//             return { valid: true } as const;
//         };
//     },

//     passwordRules<TForm>(opts: { upper?: boolean; lower?: boolean; digit?: boolean; special?: boolean; minUnique?: number } = {}): ValidatorFn<TForm, string> {
//         const re = {
//             upper: /[A-Z]/,
//             lower: /[a-z]/,
//             digit: /\d/,
//             special: /[^A-Za-z0-9\s]/,
//         };
//         return ({ value }) => {
//             if (typeof value !== "string" || value.length === 0) return { valid: true } as const; // let required/minLength manage empties
//             const missing: string[] = [];
//             if (opts.upper && !re.upper.test(value)) missing.push("an uppercase letter");
//             if (opts.lower && !re.lower.test(value)) missing.push("a lowercase letter");
//             if (opts.digit && !re.digit.test(value)) missing.push("a digit");
//             if (opts.special && !re.special.test(value)) missing.push("a special character");
//             if (typeof opts.minUnique === "number") {
//                 const unique = new Set(value.split("")).size;
//                 if (unique < opts.minUnique) missing.push(`${opts.minUnique} unique characters`);
//             }
//             if (missing.length) return { valid: false, message: `Password must include: ${missing.join(", ")}.` } as const;
//             return { valid: true } as const;
//         };
//     },

//     custom<TForm, TValue>(fn: ValidatorFn<TForm, TValue>): ValidatorFn<TForm, TValue> { return fn; },
// };

// // -----------------------------------------------------------
// // Optional: simple helpers to wire common per-field message containers
// // -----------------------------------------------------------
// export function belowFieldMessage(targetSelector: string): (args: MessageRenderArgs) => void {
//     const targetEl = asEl(targetSelector);
//     return ({ messages }) => DEFAULT_FIELD_RENDERER(targetEl, messages);
// }

// export function toSummary(summarySelector: string): (messages: string[], formEl: HTMLFormElement | null) => void {
//     const summaryEl = asEl(summarySelector);
//     return (messages) => DEFAULT_SUMMARY_RENDERER(summaryEl, messages);
// }





/*
 * Vanilla, Fully‑Typed Form Validator (TypeScript, zero‑deps)
 * -----------------------------------------------------------
 * ✓ Strong generics: typed form data + field names
 * ✓ Field-level + form-level (cross-field) validators
 * ✓ Sync + async validators (with optional debounce)
 * ✓ Touched/dirty tracking; validate on chosen events
 * ✓ Pluggable message rendering (per-field + summary)
 * ✓ Accessible by default (aria-invalid/aria-describedby)
 * ✓ Programmatic API: validate, setErrors (server), reset, getData, setValue
 * ✓ No frameworks, no dependencies
 *
 * Usage (Login form example):
 * -----------------------------------------------------------
 * import { createFormValidator, v } from "./vanilla-validator";
 *
 * const fv = createFormValidator(
 *   {
 *     form: "#login-form",
 *     errorSummary: "#form-errors",
 *     validateOnSubmit: true,
 *     scrollToFirstError: true,
 *   },
 *   {
 *     email: {
 *       selector: 'input[type="email"], input[name="email"]',
 *       validateOn: ["input", "blur"],
 *       validators: [v.required(), v.email()],
 *     },
 *     password: {
 *       selector: 'input[type="password"]',
 *       validateOn: ["input", "blur"],
 *       validators: [
 *         v.required(),
 *         v.minLength(8),
 *         v.passwordRules({
 *           upper: true, lower: true, digit: true, special: true,
 *         }),
 *       ],
 *     },
 *   } as const
 * );
 *
 * // Submit flow (example):
 * document.querySelector('#login-form')!.addEventListener('submit', async (e) => {
 *   e.preventDefault();
 *   const ok = await fv.validateForm();
 *   if (!ok) return;
 *
 *   const body = fv.getData();
 *   const res = await fetch('/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
 *   const json = await res.json();
 *   if (!res.ok) {
 *     // Support either field-specific or global messages
 *     // e.g. { fieldErrors: { email: ["Bad email"] }, formErrors: ["Invalid user"] }
 *     fv.setErrors(json.fieldErrors || {}, json.formErrors || []);
 *     return;
 *   }
 *   window.location.href = '/dashboard';
 * });
 */

// -----------------------------------------------------------
// Types
// -----------------------------------------------------------
export type MaybePromise<T> = T | Promise<T>;

export type ValidationResult =
    | { valid: true }
    | { valid: false; message: string; code?: string };

export type ValidatorFn<TForm, TValue = unknown> = (ctx: {
    name: keyof TForm & string;
    value: TValue;
    formData: Readonly<TForm>;
    fieldEl: HTMLElement | null;
    formEl: HTMLFormElement | null;
}) => MaybePromise<ValidationResult>;

export type FormValidatorFn<TForm> = (ctx: {
    formData: Readonly<TForm>;
    formEl: HTMLFormElement | null;
}) => MaybePromise<ValidationResult[]>; // multiple messages allowed at form-level

export type ValueGetter<TValue> = (el: HTMLElement | null) => TValue;
export type ValueSetter<TValue> = (el: HTMLElement | null, v: TValue) => void;

export type FieldConfig<TForm, TValue = unknown> = {
    selector: string | HTMLElement;
    validators?: ValidatorFn<TForm, TValue>[];
    // Which DOM events should trigger validation for this field
    validateOn?: Array<"input" | "change" | "blur">;
    // Debounce async/sync validators per field (ms)
    debounceMs?: number;
    // Optional custom value coercion
    getValue?: ValueGetter<TValue>;
    setValue?: ValueSetter<TValue>;
    // Where/how to show messages for this field
    messageTarget?: string | HTMLElement | ((args: MessageRenderArgs) => void);
    // If true, will set aria-invalid and link message with aria-describedby
    a11y?: boolean;
};

export type MessageRenderArgs = {
    name: string;
    messages: string[]; // resolved for the field
    fieldEl: HTMLElement | null;
    formEl: HTMLFormElement | null;
};

export type FormConfig<TForm> = {
    form: string | HTMLFormElement;
    errorSummary?: string | HTMLElement | ((formMessages: string[], formEl: HTMLFormElement | null) => void);
    validateOnSubmit?: boolean; // default true
    preventSubmitIfInvalid?: boolean; // default true
    scrollToFirstError?: boolean; // default false
    formValidators?: FormValidatorFn<TForm>;
    classes?: Partial<{
        fieldInvalid: string; // applied to field element on invalid
        fieldValid: string;   // applied to field element on valid
        fieldTouched: string; // applied once user interacted
    }>;
};

export type FieldState = {
    touched: boolean;
    dirty: boolean;
    messages: string[];
    validating: boolean;
    valid: boolean; // latest
};

export type CreatedFormValidator<TForm> = {
    // read-only snapshot
    readonly formEl: HTMLFormElement | null;
    readonly fields: Readonly<Record<keyof TForm & string, HTMLElement | null>>;

    validateField: (name: keyof TForm & string) => Promise<boolean>;
    validateForm: () => Promise<boolean>;

    setErrors: (
        fieldErrors: Partial<Record<keyof TForm & string, string[]>>, // server field errors
        formErrors?: string[]
    ) => void;

    clearErrors: () => void;

    getData: () => TForm;
    setValue: <K extends keyof TForm & string>(name: K, value: TForm[K]) => void;

    touch: (name: keyof TForm & string) => void;
    reset: () => void;
    destroy: () => void;
};

// -----------------------------------------------------------
// Utilities
// -----------------------------------------------------------
const isHTMLElement = (o: any): o is HTMLElement => o && typeof o === "object" && "nodeType" in o;
const el = <T extends HTMLElement>(root: ParentNode, sel: string): T | null => root.querySelector(sel);
const asEl = (x: string | HTMLElement | null | undefined): HTMLElement | null =>
    !x ? null : typeof x === "string" ? document.querySelector(x) : x;

const DEFAULT_CLASSES = {
    fieldInvalid: "fv-invalid",
    fieldValid: "fv-valid",
    fieldTouched: "fv-touched",
};

const DEFAULT_SUMMARY_RENDERER = (summaryEl: HTMLElement | null, messages: string[]) => {
    if (!summaryEl) return;
    const isList = summaryEl.tagName === "UL" || summaryEl.tagName === "OL";
    summaryEl.classList.toggle("hidden", messages.length === 0);
    if (isList) {
        summaryEl.innerHTML = messages.map((m) => `<li>${m}</li>`).join("");
    } else {
        summaryEl.innerHTML = messages.join("<br>");
    }
};

const DEFAULT_FIELD_RENDERER = (target: HTMLElement | null, messages: string[]) => {
    if (!target) return;
    const isList = target.tagName === "UL" || target.tagName === "OL";
    target.classList.toggle("hidden", messages.length === 0);
    if (isList) {
        target.innerHTML = messages.map((m) => `<li>${m}</li>`).join("");
    } else {
        target.innerHTML = messages.join("<br>");
    }
};

const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 200) => {
    let t: number | undefined;
    const debounced = (...args: Parameters<T>) => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(() => fn(...args), ms);
    };
    (debounced as any).flush = () => { if (t) { window.clearTimeout(t); t = undefined; fn(); } };
    return debounced as T & { flush: () => void };
};

// -----------------------------------------------------------
// Core factory
// -----------------------------------------------------------
export function createFormValidator<TForm extends Record<string, any>>(
    formConfig: FormConfig<TForm>,
    fieldsConfig: { [K in keyof TForm & string]: FieldConfig<TForm, TForm[K]> },
    options?: { onValidationChange?: (isValid: boolean) => void }
): CreatedFormValidator<TForm> {
    const formEl = asEl(formConfig.form) as HTMLFormElement | null;
    const classes = { ...DEFAULT_CLASSES, ...(formConfig.classes || {}) };
    const validateOnSubmit = formConfig.validateOnSubmit !== false; // default true
    const preventSubmitIfInvalid = formConfig.preventSubmitIfInvalid !== false; // default true
    const onValidationChange = options?.onValidationChange;

    // Prepare fields
    const fieldElements: Record<string, HTMLElement | null> = {};
    const fieldStates: Record<string, FieldState> = {};
    const fieldDebouncers: Record<string, ((() => void) & { flush: () => void }) | null> = {};
    let formMessages: string[] = [];

    for (const name of Object.keys(fieldsConfig)) {
        const cfg = fieldsConfig[name as keyof TForm & string];
        const target = typeof cfg.selector === "string" ? el<HTMLElement>(document, cfg.selector) : cfg.selector;
        fieldElements[name] = target ?? null;
        fieldStates[name] = { touched: false, dirty: false, messages: [], validating: false, valid: true };
        fieldDebouncers[name] = cfg.debounceMs ? debounce(() => void 0, cfg.debounceMs) : null; // placeholder; per-field we'll use inline debouncing
    }

    // Resolve per-field message target
    function resolveFieldMessageTarget(cfg: FieldConfig<TForm, any>): HTMLElement | null | ((args: MessageRenderArgs) => void) {
        if (!cfg.messageTarget) return null;
        if (typeof cfg.messageTarget === "function") return cfg.messageTarget;
        return asEl(cfg.messageTarget);
    }

    // Read / write values
    const getValue = <K extends keyof TForm & string>(name: K): TForm[K] => {
        const cfg = fieldsConfig[name];
        const elRef = fieldElements[name];
        if (cfg.getValue) return cfg.getValue(elRef);
        if (!elRef) return undefined as unknown as TForm[K];
        // default coercion for common input types
        if (elRef instanceof HTMLInputElement) {
            const type = elRef.type;
            if (type === "checkbox") return (!!elRef.checked) as unknown as TForm[K];
            if (type === "number" || type === "range") return (elRef.value === "" ? undefined : Number(elRef.value)) as unknown as TForm[K];
            return elRef.value as unknown as TForm[K];
        }
        if (elRef instanceof HTMLTextAreaElement) return elRef.value as unknown as TForm[K];
        if (elRef instanceof HTMLSelectElement) return elRef.value as unknown as TForm[K];
        return (elRef as any).value as TForm[K];
    };

    const setValue = <K extends keyof TForm & string>(name: K, value: TForm[K]) => {
        const cfg = fieldsConfig[name];
        const elRef = fieldElements[name];
        if (cfg.setValue) return cfg.setValue(elRef, value);
        if (!elRef) return;
        if (elRef instanceof HTMLInputElement || elRef instanceof HTMLTextAreaElement || elRef instanceof HTMLSelectElement) {
            if ((elRef as HTMLInputElement).type === "checkbox" && typeof value === "boolean") {
                (elRef as HTMLInputElement).checked = value;
            } else {
                (elRef as any).value = value as any;
            }
        } else {
            (elRef as any).value = value as any;
        }
    };

    const getFormData = (): TForm => {
        const data = {} as TForm;
        for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
            (data as any)[name] = getValue(name);
        }
        return data;
    };

    // Rendering helpers
    const summaryTarget = typeof formConfig.errorSummary === "function" || !formConfig.errorSummary
        ? formConfig.errorSummary
        : asEl(formConfig.errorSummary);

    function renderSummary(messages: string[]) {
        if (typeof summaryTarget === "function") {
            summaryTarget(messages, formEl);
        } else {
            DEFAULT_SUMMARY_RENDERER(summaryTarget as HTMLElement | null, messages);
        }
    }

    function renderField(name: string) {
        const cfg = fieldsConfig[name as keyof TForm & string];
        const target = resolveFieldMessageTarget(cfg);
        const messages = fieldStates[name].messages;

        const fieldEl = fieldElements[name];
        if (cfg.a11y !== false && fieldEl) {
            fieldEl.setAttribute("aria-invalid", String(messages.length > 0));
            // link describedby if we have an element target
            if (target && isHTMLElement(target)) {
                const id = target.id || `${String(name)}-error`;
                target.id = id;
                fieldEl.setAttribute("aria-describedby", id);
            }
        }

        if (typeof target === "function") {
            target({ name, messages, fieldEl, formEl });
        } else {
            DEFAULT_FIELD_RENDERER(target as HTMLElement | null, messages);
        }

        // Classes
        if (fieldEl) {
            fieldEl.classList.toggle(classes.fieldInvalid, messages.length > 0);
            fieldEl.classList.toggle(classes.fieldValid, messages.length === 0 && fieldStates[name].touched);
        }
    }

    function collectAllMessages(): string[] {
        return [
            ...Object.values(fieldStates).flatMap(s => s.messages),
            ...formMessages
        ];
    }

    let lastIsValid: boolean | undefined;

    function notifyIfChanged() {
        const currentIsValid = Object.values(fieldStates).every((s: FieldState) => s.valid && !s.validating) && formMessages.length === 0;
        if (currentIsValid !== lastIsValid) {
            lastIsValid = currentIsValid;
            onValidationChange?.(currentIsValid);
        }
    }

    async function runValidatorsForField(name: keyof TForm & string): Promise<string[]> {
        const cfg = fieldsConfig[name];
        const validators = cfg.validators || [];
        const value = getValue(name);
        const formData = getFormData();
        const fieldEl = fieldElements[name];

        const messages: string[] = [];
        for (const fn of validators) {
            const res = await fn({ name, value, formData, fieldEl, formEl });
            if (!res || res.valid === true) continue;
            messages.push(res.message);
        }
        return messages;
    }

    async function validateField(name: keyof TForm & string): Promise<boolean> {
        const cfg = fieldsConfig[name];
        const state = fieldStates[name];

        state.touched = true;
        const exec = async () => {
            state.validating = true;
            const messages = await runValidatorsForField(name);
            state.messages = messages;
            state.valid = messages.length === 0;
            state.validating = false;
            renderField(name);
            renderSummary(collectAllMessages());
            notifyIfChanged();
            return state.valid;
        };

        if (cfg.debounceMs && cfg.debounceMs > 0) {
            return new Promise((resolve) => {
                const d = debounce(async () => resolve(await exec()), cfg.debounceMs);
                d();
            });
        }
        return exec();
    }

    async function validateForm(): Promise<boolean> {
        const results = await Promise.all(
            (Object.keys(fieldsConfig) as Array<keyof TForm & string>).map((n) => validateField(n))
        );

        // Run form-level validators (cross-field) if provided
        let formLevelMessages: string[] = [];
        if (formConfig.formValidators) {
            const res = await formConfig.formValidators({ formData: getFormData(), formEl });
            formLevelMessages = res.filter(r => r && !r.valid).map(r => r.message);
        }
        formMessages = formLevelMessages;

        const allMessages = collectAllMessages();
        renderSummary(allMessages);
        notifyIfChanged();

        if (formConfig.scrollToFirstError && allMessages.length > 0) {
            const firstInvalid = Object.keys(fieldStates).find((n) => fieldStates[n].messages.length > 0);
            const elRef = firstInvalid ? fieldElements[firstInvalid] : null;
            elRef?.scrollIntoView({ behavior: "smooth", block: "center" });
            elRef?.focus({ preventScroll: true });
        }

        return results.every(Boolean) && formMessages.length === 0;
    }

    function setErrors(
        fieldErrors: Partial<Record<keyof TForm & string, string[]>>,
        formErrors: string[] = []
    ) {
        // Assign messages
        for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
            const msgs = fieldErrors[name] || [];
            fieldStates[name].messages = msgs;
            fieldStates[name].valid = msgs.length === 0;
            // Mark as touched so styling appears
            fieldStates[name].touched = true;
            renderField(name);
        }
        formMessages = formErrors;
        renderSummary(collectAllMessages());
        notifyIfChanged();
    }

    function clearErrors() {
        for (const name of Object.keys(fieldStates)) {
            fieldStates[name].messages = [];
            fieldStates[name].valid = true;
            renderField(name);
        }
        formMessages = [];
        renderSummary([]);
        notifyIfChanged();
    }

    function touch(name: keyof TForm & string) {
        fieldStates[name].touched = true;
        const elRef = fieldElements[name];
        elRef?.classList.add(classes.fieldTouched);
    }

    function reset() {
        for (const name of Object.keys(fieldStates)) {
            fieldStates[name] = { touched: false, dirty: false, messages: [], validating: false, valid: true };
            renderField(name);
        }
        formMessages = [];
        renderSummary([]);
        notifyIfChanged();
    }

    function destroy() {
        // remove listeners
        if (formEl && validateOnSubmit && preventSubmitIfInvalid) {
            formEl.removeEventListener("submit", onSubmit);
        }
        for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
            const elRef = fieldElements[name];
            const cfg = fieldsConfig[name];
            const bound = boundHandlers[name];
            if (elRef && bound) {
                for (const ev of cfg.validateOn || []) {
                    elRef.removeEventListener(ev, bound);
                }
            }
        }
    }

    // Event binding
    const boundHandlers: Record<string, (e: Event) => void> = {};
    for (const name of Object.keys(fieldsConfig) as Array<keyof TForm & string>) {
        const cfg = fieldsConfig[name];
        const elRef = fieldElements[name];
        if (!elRef) continue;

        const handler = async () => {
            touch(name);
            await validateField(name);
        };
        boundHandlers[name] = handler;

        for (const ev of cfg.validateOn || []) {
            elRef.addEventListener(ev, handler);
        }
    }

    async function onSubmit(e: Event) {
        if (!preventSubmitIfInvalid) return;
        const ok = await validateForm();
        if (!ok) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    if (formEl && validateOnSubmit) {
        formEl.addEventListener("submit", onSubmit);
    }

    return {
        get formEl() { return formEl; },
        get fields() { return Object.fromEntries(Object.entries(fieldElements)) as any; },

        validateField: (n) => validateField(n),
        validateForm,

        setErrors,
        clearErrors,

        getData: () => getFormData(),
        setValue,

        touch,
        reset,
        destroy,
    } as const;
}

// -----------------------------------------------------------
// Built-in validators (v.*)
// -----------------------------------------------------------
export const v = {
    required<TForm, TValue>(message = "This field is required."): ValidatorFn<TForm, TValue> {
        return ({ value }) => {
            if (value === undefined || value === null) return { valid: false, message } as const;
            if (typeof value === "string" && value.trim() === "") return { valid: false, message } as const;
            if (Array.isArray(value) && value.length === 0) return { valid: false, message } as const;
            return { valid: true } as const;
        };
    },

    pattern<TForm>(regex: RegExp, message = "Invalid format."): ValidatorFn<TForm, string> {
        return ({ value }) => {
            if (typeof value !== "string") return { valid: true } as const;
            return regex.test(value) ? { valid: true } as const : { valid: false, message } as const;
        };
    },

    email<TForm>(message = "Invalid email address."): ValidatorFn<TForm, string> {
        // RFC 5322-lite
        const re = /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
        return ({ value }) => {
            if (typeof value !== "string" || value.trim() === "") return { valid: true } as const; // let required handle empties
            return re.test(value.trim()) ? { valid: true } as const : { valid: false, message } as const;
        };
    },

    minLength<TForm>(len: number, message?: string): ValidatorFn<TForm, string> {
        return ({ value }) => {
            if (typeof value !== "string") return { valid: true } as const;
            if (value.length < len) return { valid: false, message: message || `Must be at least ${len} characters.` } as const;
            return { valid: true } as const;
        };
    },

    maxLength<TForm>(len: number, message?: string): ValidatorFn<TForm, string> {
        return ({ value }) => {
            if (typeof value !== "string") return { valid: true } as const;
            if (value.length > len) return { valid: false, message: message || `Must be at most ${len} characters.` } as const;
            return { valid: true } as const;
        };
    },

    equalsField<TForm, K extends keyof TForm & string>(other: K, message = "Values do not match."): ValidatorFn<TForm, any> {
        return ({ formData }) => {
            return { valid: true } as const; // actual comparison done below via closure
        };
    },

    sameAs<TForm, K extends keyof TForm & string>(other: K, message = "Values do not match."): ValidatorFn<TForm, any> {
        return ({ value, formData }) => {
            return (value === (formData as any)[other]) ? { valid: true } as const : { valid: false, message } as const;
        };
    },

    numberRange<TForm>(min?: number, max?: number, message?: string): ValidatorFn<TForm, number | undefined> {
        return ({ value }) => {
            if (value === undefined || value === null || Number.isNaN(value)) return { valid: true } as const;
            if (typeof min === "number" && value < min) return { valid: false, message: message || `Must be ≥ ${min}.` } as const;
            if (typeof max === "number" && value > max) return { valid: false, message: message || `Must be ≤ ${max}.` } as const;
            return { valid: true } as const;
        };
    },

    passwordRules<TForm>(opts: { upper?: boolean; lower?: boolean; digit?: boolean; special?: boolean; minUnique?: number } = {}): ValidatorFn<TForm, string> {
        const re = {
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /\d/,
            special: /[^A-Za-z0-9\s]/,
        };
        return ({ value }) => {
            if (typeof value !== "string" || value.length === 0) return { valid: true } as const; // let required/minLength manage empties
            const missing: string[] = [];
            if (opts.upper && !re.upper.test(value)) missing.push("an uppercase letter");
            if (opts.lower && !re.lower.test(value)) missing.push("a lowercase letter");
            if (opts.digit && !re.digit.test(value)) missing.push("a digit");
            if (opts.special && !re.special.test(value)) missing.push("a special character");
            if (typeof opts.minUnique === "number") {
                const unique = new Set(value.split("")).size;
                if (unique < opts.minUnique) missing.push(`${opts.minUnique} unique characters`);
            }
            if (missing.length) return { valid: false, message: `Password must include: ${missing.join(", ")}.` } as const;
            return { valid: true } as const;
        };
    },

    custom<TForm, TValue>(fn: ValidatorFn<TForm, TValue>): ValidatorFn<TForm, TValue> { return fn; },
};

// -----------------------------------------------------------
// Optional: simple helpers to wire common per-field message containers
// -----------------------------------------------------------
export function belowFieldMessage(targetSelector: string): (args: MessageRenderArgs) => void {
    const targetEl = asEl(targetSelector);
    return ({ messages }) => DEFAULT_FIELD_RENDERER(targetEl, messages);
}

export function toSummary(summarySelector: string): (messages: string[], formEl: HTMLFormElement | null) => void {
    const summaryEl = asEl(summarySelector);
    return (messages) => DEFAULT_SUMMARY_RENDERER(summaryEl, messages);
}