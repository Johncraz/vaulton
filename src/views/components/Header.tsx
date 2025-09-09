import { LogoIcon } from "./icons/LogoIcon"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

export const Header = () => {
    return (
        <header className="w-full h-16 sm:h-24 border-b border-zinc-400/10 flex justify-between items-center gap-x-3 px-3 transition-[height] duration-200 ease-in-out">

            <div className="w-2/4 flex items-center h-full">
                <Input id="search" name="search" placeholder="Search..." className="input-field mt-0 text-lg" />
            </div>

            <div>
                <div data-user-menu="close" className="flex items-center gap-x-2 hover:cursor-pointer transition-opacity h-full relative group">
                    <div className="opacity-80 group-hover:opacity-100 transition-opacity flex flex-row items-center gap-x-2">
                        <div>
                            <img src="https://avatars.githubusercontent.com/u/1685553?v=4" alt="User Avatar" className="size-8 rounded-full object-cover" />
                        </div>
                        <h1 className="font-medium hidden sm:block">Pintu Prajapati</h1>
                    </div>

                    <div
                        className="
                            absolute w-40 right-0 top-full mt-5 p-2 z-10 
                            bg-zinc-50 dark:bg-zinc-800 border border-zinc-400/20 
                            rounded shadow-lg opacity-0 invisible 
                            group-data-[user-menu=open]:opacity-100 
                            group-data-[user-menu=open]:visible 
                            transition-opacity flex flex-col gap-y-2
                        "
                    >
                        <Button variant="ghost" className="w-full justify-start">Profile</Button>
                        <Button
                            hx-get="/logout"
                            hx-indicator="#overlay-spinner-indicator"
                            isFetchable
                            variant="soft"
                            intent="danger"
                            className="w-full justify-start"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
