import { PATH } from "@/constants";
import { Button } from "@/views/components/ui/Button";
import { Dashboard } from "@/views/pages/Dashboard";
import { Hono } from "hono";

export const dashboardRouter = new Hono().get(PATH.DASHBOARD.INDEX, (c) => {
    const isHxRequest = c.req.header("HX-Request") === "true";

    const dashboardContent = (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <Button
                id="settings-button"
                variant="soft"
                className="mt-6 w-full"
                isFetchable
                hx-history
                hx-push-url="true"
                hx-get={PATH.SETTINGS.INDEX}
                hx-target="#main-body"
                hx-swap="innerHTML"
            >
                Settings
            </Button>
        </div>
    );

    if (isHxRequest) {
        return c.html(dashboardContent);
    }

    return c.render(<Dashboard>{dashboardContent}</Dashboard>);
});
