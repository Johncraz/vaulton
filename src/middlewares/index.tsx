import type { Hono } from "hono";
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { jsxRenderer } from 'hono/jsx-renderer'
import { AuthLayout } from "@/views/AuthLayout";
import { authenticationMiddleware } from "./auth.middleware";
import { DashboardLayout } from "@/views/DashboardLayout";
import { ALLOWED_PATHS, PATH } from "@/constants";
import { loggerMiddleware } from "@/utils";

export const injectMiddlewares = (app: Hono) => {
    app.use(loggerMiddleware())
    app.use(cors())

    app.use('/static/*', serveStatic({ root: './' }))

    app.use(authenticationMiddleware(ALLOWED_PATHS))
    app.get('/*', jsxRenderer(({ children }, c) => {
        return c.req.path.startsWith(PATH.AUTH.LOGIN)
            ? <AuthLayout children={children} />
            : <DashboardLayout children={children} />
    }));
}