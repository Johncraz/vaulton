import { buildStaticPath } from "@/utils";
import type { PropsWithChildren } from "hono/jsx";
import { Spinner } from "./components/icons/Spinner";

interface Props extends PropsWithChildren { }

export const DashboardLayout = ({ children }: Props) => {
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
                    content="Pass Bunker — Secure password management dashboard"
                />
                <meta name="keywords" content="password manager, vault, security" />
                <meta name="author" content="Pass Bunker Team" />
                <meta name="robots" content="index, follow" />
                <meta name="theme-color" content="#0f172a" />

                {/* Title */}
                <title>Pass Bunker — Dashboard</title>

                {/* Favicons */}
                <link
                    rel="icon"
                    href={buildStaticPath("IMAGES", "favicon.ico")}
                    type="image/x-icon"
                />

                {/* Open Graph / Social */}
                <meta property="og:title" content="Pass Bunker — Dashboard" />
                <meta
                    property="og:description"
                    content="Secure password management with Pass Bunker."
                />
                <meta property="og:type" content="website" />

                {/* Styles */}
                <link rel="stylesheet" href={buildStaticPath("CSS", "style.css")} />
            </head>

            <body className="antialiased text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900">
                <main
                    className="w-dvw h-dvh flex justify-center items-center"
                    id="dashboard-layout"
                >
                    <section className="w-full max-w-5xl min-h-dvh">
                        {children}
                    </section>
                </main>

                {/* overlay spinner */}
                <div
                    className="htmx-indicator"
                    id="overlay-spinner-indicator"
                >
                    <Spinner className="size-14 fill-gray-700 dark:fill-gray-200" />
                </div>



                {/* Scripts (deferred for perf) */}
                {/* <script src={buildStaticPath("LIB", "htmx.min.js")} defer /> */}
                <script type="module" src={buildStaticPath("ROOT", "index.min.js")} defer />
            </body>
        </html>
    );
};
