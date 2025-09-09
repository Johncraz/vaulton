import { Button } from "../components/ui/Button";

export function NotFoundPage({ url = "" }) {
    return (
        <section className="w-full h-full pt-20 flex justify-center items-center">
            <div className="max-w-md w-full text-center">
                <h1 className="text-5xl font-bold mb-3">404</h1>
                <p className="text-sm text-gray-400 mb-6">
                    The page{" "}
                    <code className="bg-gray-800 px-1 rounded">{url || "unknown"}</code>{" "}
                    was not found.
                </p>

                <div className="flex justify-center gap-3 mb-6">
                    <Button
                        variant="soft"
                        intent="neutral"
                        type="button"
                        onclick="history.back()"
                    >
                        Go Back
                    </Button>

                    {/* Home Button (anchor navigation) */}
                    <a href="/" className="inline-block">
                        <Button intent="primary">Go Home</Button>
                    </a>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    © {new Date().getFullYear()} Your Company
                </p>
            </div>
        </section>
    );
}
