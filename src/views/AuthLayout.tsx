import { buildStaticPath } from "@/utils";
import type { PropsWithChildren } from "hono/jsx";


interface Props extends PropsWithChildren { }

export const AuthLayout = ({ children }: Props) => {
    return (
        <html lang="en" className="dark">
            <head>
                {/* Basic Meta */}
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1"
                />
                <meta
                    name="description"
                    content="Pass Bunker — Secure password management authentication"
                />
                <meta name="keywords" content="password manager, login, authentication" />
                <meta name="author" content="Pass Bunker Team" />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="theme-color" content="#0f172a" />

                {/* Title */}
                <title>Pass Bunker — Authentication</title>

                {/* Favicons */}
                <link
                    rel="icon"
                    href={buildStaticPath("IMAGES", "favicon.ico")}
                    type="image/x-icon"
                />

                {/* Styles */}
                <link rel="stylesheet" href={buildStaticPath("CSS", "style.css")} />
            </head>

            <body className="antialiased text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800">
                <main
                    className="w-dvw h-dvh flex justify-center items-center"
                    id="auth-layout"
                >
                    {children}
                </main>

                {/* Scripts */}
                <script type="module" src={buildStaticPath("ROOT", "auth.min.js")}></script>
            </body>
        </html>
    );
};
