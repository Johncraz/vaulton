import type { Hono } from "hono";
import { NotFoundPage } from "./views/pages/NotFoundPage";
import { Dashboard } from "./views/pages/Dashboard";
import logger from "./utils/logger";

export const errorController = (app: Hono) => {
  app.notFound((c) => {
    const isHxRequest = c.req.header("HX-Request") === "true";
    const jwtPayload = c.get("jwtPayload"); // set by auth middleware if user logged in

    logger.warn(
      `404 - ${c.req.method.padEnd(6)} | ${c.req.path.padEnd(40)} | ${String(
        c.res.status
      ).padEnd(3)} | IP: ${c.req.header("x-forwarded-for") ||
      c.req.raw.headers.get("host") ||
      "unknown"
      }`
    );

    const notFoundComponent = <NotFoundPage url={c.req.path} />;

    if (isHxRequest) {
      // return raw component for htmx partial swap
      return c.html(notFoundComponent);
    }

    // wrap in Dashboard layout only if user is logged in
    return c.render(
      jwtPayload ? <Dashboard>{notFoundComponent}</Dashboard> : notFoundComponent
    );
  });
};
