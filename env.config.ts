// env.config.ts
import { z } from "zod";


const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z
        .string()
        .regex(/^\d+$/, "PORT must be a number")
        .transform(Number)
        .refine((n) => n > 0 && n < 65536, "PORT must be between 1 and 65535")
        .default(1360) // default must be string before transform
        .transform(Number),
    DATABASE_URL: z.string("Database path must be provided in env."),
    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters long for security"),
    SESSION_EXP_MINUTES: z
        .string()
        .regex(/^\d+$/, "SESSION_EXP_MINUTES must be a number")
        .transform(Number)
        .refine((n) => n > 0, "SESSION_EXP_MINUTES must be greater than 0"),
});


// Validate process.env
const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of parsed.error.issues) {
        console.error(
            `  • ${issue.path.join(".")}: ${issue.message} (received: ${process.env[issue.path.join(".")] ?? "undefined"
            })`
        );
    }
    process.exit(1);
}

export const env = parsed.data;
