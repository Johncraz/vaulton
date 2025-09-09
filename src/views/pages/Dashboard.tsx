import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import type { PropsWithChildren } from "hono/jsx"
import { twMerge } from "tailwind-merge"

interface Props extends PropsWithChildren {
    className?: string
}
export const Dashboard = ({ children, className }: Props) => {
    return (
        <section class="w-full min-w-xs max-w-5xl min-h-dvh mx-auto bg-zinc-100 dark:bg-zinc-800 flex">
            <Sidebar />
            <main className="flex-1 max-h-dvh">
                <Header />
                <div
                    id="main-body"
                    className={twMerge('w-full max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto p-4', className)}
                >
                    {children}
                </div>
            </main>
        </section>
    )
}