
import { LogoIcon } from "@/components/icons/LogoIcon"
import { Input } from '@/components/ui/Input'
import { Button } from "@/components/ui/Button"
import { SecureInputWithToggle } from "../components/ui/PasswordWithToggle"


export const Login = () => {
    return (
        <div class="w-full max-w-sm rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 relative">
            <div className="w-full flex items-center gap-x-2">
                <LogoIcon className="size-12" />

                <div className="text-start">
                    <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-100">Pass Bunker</h2>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Welcome back! Please login to your account.
                    </p>
                </div>
            </div>

            <form class="mt-6 space-y-4" id="login-form">
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
                <SecureInputWithToggle
                    label="Password"
                    name="password"
                    placeholder="Password"
                />

                <Button isFetchable variant="solid" intent="primary" className="mt-4 w-full" type="submit">
                    Login In
                </Button>
            </form>

            {/* <!-- Error UI --> */}
            <ul
                id="form-errors"
                class="hidden absolute w-[95%] left-1/2 -translate-x-1/2 top-full error-wrapper"
            />
            <ul
                id="response-errors"
                class="hidden absolute w-[95%] left-1/2 -translate-x-1/2 top-full error-wrapper"
            />

        </div>

    )
}
