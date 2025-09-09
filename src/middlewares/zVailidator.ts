import type { ValidationTargets } from "hono";
import type { ZodSchema } from "zod";
import { zValidator as zv } from '@hono/zod-validator'
import logger from "@/utils/logger";
import { createFailureResponse, ERROR_NAMES } from "@/utils/response.util";

export const zValidator = <
    T extends ZodSchema,
    Target extends keyof ValidationTargets,
>(
    target: Target,
    schema: T,
) =>
    zv(target, schema, async (result, c) => {
        if (!result.success) {
            const errors = result.error.issues.map(err => err.message)
            logger.error(`zVailidation - PATH -  ${c.req.path} - METHOD ${c.req.method} - ERROR(s) - ${errors.join(", - ")}`)

            const res = createFailureResponse(ERROR_NAMES.VALIDATION_ERROR, "Request validation failed", errors)
            return c.json(res, 422);
        }
    });