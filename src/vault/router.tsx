import { PATH } from "@/constants";
import { Hono } from "hono";

export const vaultRouter = new Hono()

    .get(PATH.VAULT.SETUP, (c) => {

        return c.render(<p className="bg-rose-400">Vault Setup.....</p>)
    })

