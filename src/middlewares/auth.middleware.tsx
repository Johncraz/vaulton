import { createFactory } from "hono/factory";
import { getCookie } from "hono/cookie";
import { COOKIES_NAME, PATH } from "@/constants";
import { verifyJwtToken } from "@/utils/jwtFactory";
import { env } from "env.config";
const { createMiddleware } = createFactory();


export const authenticationMiddleware = (allowedPaths: string[]) => createMiddleware(async (c, next) => {
    if (allowedPaths.some(path => c.req.path.startsWith(path))) await next(); // Don't check token for the allowed paths

    const token = getCookie(c, COOKIES_NAME)
    if (!token) return c.redirect(PATH.AUTH.LOGIN);

    // verify token 
    try {
        const payload = await verifyJwtToken(token, env.JWT_SECRET);
        c.set("jwtPayload", payload);
        await next();
    } catch {
        return c.redirect(PATH.AUTH.LOGIN);
    }
})