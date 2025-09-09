// AuthenticationException.ts
export class AuthenticationException extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(message: string, statusCode = 401, details?: unknown) {
        super(message);
        this.name = "AuthenticationException";
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where the error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthenticationException);
        }
    }
}
