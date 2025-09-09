import z from "zod";

export const loginSchema = z.object({
    email: z.email("Email required in valid format"),
    password: z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain a special character")
});


// Infer the type from the schema
export type LoginInput = z.infer<typeof loginSchema>;