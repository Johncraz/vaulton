import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { env } from "env.config";

const sqlite = new Database(env.DATABASE_URL);
export const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./drizzle" });