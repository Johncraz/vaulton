// src/database/schema/users.ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => Bun.randomUUIDv7()), // Auto-generate UUID as TEXT

    fullName: text("full_name").notNull(),

    email: text("email").notNull().unique(),

    password: text("password").notNull(),

    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString())
        .$onUpdateFn(() => new Date().toISOString()),
});

export type SelectUser = typeof usersTable.$inferSelect
export type insertUser = typeof usersTable.$inferInsert