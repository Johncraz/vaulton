import { PATH } from "@/constants"
import { CategoryIcon } from "./icons/Category"
import { HomeIcon } from "./icons/Home"
import { LogoIcon } from "./icons/LogoIcon"
import { SettingIcon } from "./icons/Setting"

const menuItems = [
    { label: "Dashboard", Icon: HomeIcon, path: PATH.DASHBOARD.INDEX },
    { label: "Categories", Icon: CategoryIcon, path: PATH.CATEGORIES.INDEX },
    { label: "Settings", Icon: SettingIcon, path: PATH.SETTINGS.INDEX },
]

export const Sidebar = () => {
    return (
        <div className="w-24 sm:w-28 transition-[width] duration-200 ease-in-out h-dvh border-r border-zinc-400/30 dark:border-zinc-700/40 flex flex-col justify-between items-center">

            {/* Logo Section */}
            <div className="h-28 w-full flex justify-center items-start pt-4">
                <LogoIcon className="size-16 fill-emerald-600" />
            </div>

            {/* Menu Items */}
            <ul className="w-full flex-1 space-y-2 text-xs sm:text-base font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 transition-[width,font-size] duration-200 ease-in-out">
                {menuItems.map(({ label, Icon, path }) => (
                    <li
                        key={label}
                        className="p-2 w-full rounded cursor-pointer flex flex-col items-center gap-y-2 group transition-colors duration-200
                       hover:text-emerald-700 dark:hover:text-emerald-400"
                        hx-get={path}
                        hx-trigger="click"
                        hx-indicator="#overlay-spinner-indicator"
                        hx-target="#main-body"
                        hx-swap="innerHTML"
                        hx-push-url="true"
                    >
                        <Icon className="size-6 sm:size-8 transition-colors duration-200 group-hover:fill-emerald-500 dark:group-hover:fill-emerald-400" />
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    )
}
