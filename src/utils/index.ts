import { PATH } from "@/constants";
import { createMiddleware } from "hono/factory";
import logger from "./logger";

type StaticFiles = {
  CSS: "style.css";
  LIB: "htmx.min.js";
  IMAGES: "favicon.svg" | "favicon.png" | "favicon.ico";
  ROOT: "index.min.js" | "auth.min.js" | "settings.min.js" | "";
};

export const buildStaticPath = <T extends keyof typeof PATH.STATIC>(
  pathType: T,
  fileName: StaticFiles[T],
): string => {
  const basePath = PATH.STATIC[pathType];
  return `${basePath}/${fileName}`.replace(/\/+/, "/");
};

export const loggerMiddleware = () =>
  createMiddleware(async (c, next) => {
    const start = Date.now();

    await next(); // Process the request first

    const duration = `${Date.now() - start}ms`.padEnd(5);
    const method = c.req.method.padEnd(6); // Align method column (e.g., GET, POST)
    const path = c.req.path.padEnd(40);    // Adjust width based on your longest route
    const status = String(c.res.status).padEnd(3);
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.raw.headers.get("host") ||
      "unknown";

    logger.info(
      `- ${method} | ${path} | ${status} | ${duration} | IP: ${ip}`
    );
  });

