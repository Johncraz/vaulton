import { Login } from "@/views/pages/Login";
import { Hono } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { handleLogin } from "./auth.handler";
import { COOKIES_NAME } from "@/constants";


export const authRoute = new Hono()

    .get('/login', async (c) => {

        const token = getCookie(c, COOKIES_NAME)
        if (token) return c.redirect('/');

        c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        c.header("Pragma", "no-catch")
        c.header("Expires", '0')
        c.header("Surrogate-Control", "no-store")
        return c.render(<Login />)
    })
    .post('/login', ...handleLogin)



    .get('/logout', (c) => {
        deleteCookie(c, COOKIES_NAME);

        c.header("HX-Refresh", "true");
        return c.body(null, 200); // no redirect, Htmx will reload the page
    })