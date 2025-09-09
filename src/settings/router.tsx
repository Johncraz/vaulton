import { buildStaticPath } from "@/utils";
import { Button } from "@/views/components/ui/Button";
import { SecureInputWithToggle } from "@/views/components/ui/PasswordWithToggle";
import { Dashboard } from "@/views/pages/Dashboard";
import { Hono } from "hono";

export const settingsRouter = new Hono()

    .get("/settings", (c) => {
        const isHxRequest = c.req.header("HX-Request") === "true";

        // Professional vault PIN form
        const settingsForm = (
            <>
                <div className="w-full max-w-sm mx-auto p-6  border border-zinc-700 rounded-2xl shadow-lg mt-32">
                    <h1 className="text-2xl font-semibold text-white mb-2">Set Your Vault PIN</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Your vault PIN secures access. Use 4 or 6 digits only.
                    </p>
                    <form className="space-y-5" id="vault-pin-setup-form">
                        <SecureInputWithToggle
                            label="Set Vault PIN"
                            name="pin"
                            placeholder="••••"
                            inputClass="text-center font-mono text-lg tracking-[0.8em] caret-transparent"
                            maxLength={6}
                            pattern="\d*"
                            inputMode="numeric"
                            required
                        />

                        <SecureInputWithToggle
                            label="Confirm Vault PIN"
                            name="confirmPin"
                            placeholder="••••"
                            inputClass="text-center font-mono text-lg tracking-[0.8em] caret-transparent"
                            maxLength={6}
                            pattern="\d*"
                            inputMode="numeric"
                            required
                        />

                        <Button
                            type="submit"
                            intent="primary"
                            className="w-full"
                        >
                            Save Changes
                        </Button>
                    </form>
                </div>
                <script type="module" src={buildStaticPath("ROOT", "settings.min.js")} defer></script>
            </>
        );

        return isHxRequest
            ? c.html(settingsForm)
            : c.render(<Dashboard>{settingsForm}</Dashboard>);
    });
