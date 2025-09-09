import { sign, verify, decode } from "hono/jwt";
import type { JWTPayload as HonoJWTPayload } from "hono/utils/jwt/types";

/**
 * Your application-specific JWT payload
 */
export interface AppJWTPayload {
    userId: string;
}

/**
 * Utility type that merges app payload with standard JWT claims
 */
export type AppJWTClaims = AppJWTPayload & HonoJWTPayload;

/**
 * Default JWT settings
 */
const JWT_DEFAULTS = {
    algorithm: "HS512" as const,
    defaultExpiryMinutes: 10,
};

/**
 * Generates a signed JWT token.
 * @param payload - Application-specific payload
 * @param secretKey - The signing secret key
 * @param expiresInMinutes - Token expiry in minutes (default: 10)
 * @returns Object containing token string and cookie expiration date
 */
export const generateJwtToken = async (
    payload: AppJWTPayload,
    secretKey: string,
    expiresInMinutes: number = JWT_DEFAULTS.defaultExpiryMinutes
): Promise<{ token: string; cookieExpiry: Date }> => {

    const issuedAt = Math.floor(Date.now() / 1000); // seconds
    const expiresAt = issuedAt + expiresInMinutes * 60;

    const jwtPayload: AppJWTClaims = {
        ...payload,
        iat: issuedAt,
        exp: expiresAt,
    };

    const token = await sign(jwtPayload, secretKey, JWT_DEFAULTS.algorithm);

    return {
        token,
        cookieExpiry: new Date(expiresAt * 1000), // for setting cookies
    };
};

/**
 * Verifies and decodes a JWT token.
 * @param token - The JWT string
 * @param secretKey - The signing secret key
 */
export const verifyJwtToken = async <T extends object = AppJWTPayload>(
    token: string,
    secretKey: string
): Promise<T & HonoJWTPayload> => {
    return verify(token, secretKey, JWT_DEFAULTS.algorithm) as Promise<T & HonoJWTPayload>;
};

/**
 * Decodes a JWT token without verifying.
 */
export const decodeJwtToken = <T extends object = AppJWTPayload>(
    token: string
): (T & HonoJWTPayload) | null => {
    const decoded = decode(token);
    return decoded?.payload as T & HonoJWTPayload;
};
