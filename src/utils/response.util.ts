// Error names as a constant object
export const ERROR_NAMES = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    AUTH_ERROR: "AUTH_ERROR",
    NOT_FOUND: "NOT_FOUND",
    SERVER_ERROR: "SERVER_ERROR",
} as const;

// Type of allowed error names (derived automatically)
export type ERROR_NAME = typeof ERROR_NAMES[keyof typeof ERROR_NAMES];

// Base structure for all responses
export interface BaseResponse<T = undefined> {
    success: boolean;
    message: string;
    data?: T;
}

export interface FailureResponse<T = undefined> extends BaseResponse<T> {
    name: ERROR_NAME;
}

// Success factory
export function createSuccessResponse<T = undefined>(
    message: string,
    data?: T
): BaseResponse<T> {
    return {
        success: true,
        message,
        ...(data !== undefined && { data }),
    };
}

// Failure factory (type-safe error name)
export function createFailureResponse<T = undefined>(
    name: ERROR_NAME,
    message: string,
    data?: T
): FailureResponse<T> {
    return {
        success: false,
        message,
        name,
        ...(data !== undefined && { data }),
    };
}
