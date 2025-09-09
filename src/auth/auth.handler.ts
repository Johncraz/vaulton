import { createFailureResponse, createSuccessResponse, ERROR_NAMES } from '@/utils/response.util'
import { AuthenticationException } from '@/exception/Authentication'
import { zValidator } from '@/middlewares/zVailidator'
import { generateJwtToken } from '@/utils/jwtFactory'

import { createFactory } from 'hono/factory'
import { setCookie } from 'hono/cookie'
import { loginSchema } from './auth.modal'
import { AuthService } from './auth.service'
import { COOKIES_NAME } from '@/constants'
import { env } from 'env.config'

const { createHandlers } = createFactory()

export const handleLogin = createHandlers(
    zValidator("json", loginSchema),
    async (c) => {
        try {
            const loginInput = c.req.valid("json");
            const user = await AuthService.login(loginInput);

            const { token, cookieExpiry } = await generateJwtToken(
                { userId: user.id },
                env.JWT_SECRET,
                env.SESSION_EXP_MINUTES // from .env (instead of hardcoded 2)
            );

            // Set secure cookie
            setCookie(c, COOKIES_NAME, token, {
                expires: cookieExpiry,
                httpOnly: true,
                secure: env.NODE_ENV === "production", // only secure in production
                sameSite: "Strict",
                path: "/",
            });

            return c.json(createSuccessResponse("Login successful.", { user }), 200);
        } catch (err) {
            if (err instanceof AuthenticationException) {
                return c.json(createFailureResponse(ERROR_NAMES.AUTH_ERROR, err.message), err.statusCode as any)
            }
            console.error("Unexpected error in handleLogin:", err);
            return c.json(createFailureResponse(ERROR_NAMES.AUTH_ERROR, "Internal server error, please try later."), 500);
        }
    }
);


