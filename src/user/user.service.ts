// src/services/user.service.ts
import { db } from "@/database";
import { usersTable, insertUser, SelectUser } from "@/database/schema/users";
import { count, eq } from "drizzle-orm";

// ✅ Check if user exists by unique field
const isExist = async (
    field: keyof Pick<SelectUser, "email" | "id">,
    value: string
): Promise<boolean> => {
    const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable[field], value));

    return !!user;
};

// ✅ Create user
const register = async (user: insertUser): Promise<void> => {
    const hashPassword = await Bun.password.hash(user.password);

    await db.insert(usersTable).values({
        fullName: user.fullName,
        email: user.email,
        password: hashPassword,
    });
};

// ✅ Get all users with pagination
const findAll = async (
    page: number = 1,
    pageSize: number = 10
): Promise<{ data: SelectUser[]; total: number; page: number; pageSize: number }> => {
    const offset = (page - 1) * pageSize;

    const data = await db
        .select()
        .from(usersTable)
        .limit(pageSize)
        .offset(offset);

    const [{ total }] = await db
        .select({ total: count(usersTable.id) })
        .from(usersTable);

    return { data, total, page, pageSize };
};

// ✅ Get user by ID
const findById = async (id: string): Promise<SelectUser | undefined> => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
};

// ✅ Get user by Email
const findByEmail = async (email: string): Promise<SelectUser | undefined> => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
};

// ✅ Update user by ID
const updateById = async (id: string, data: Partial<insertUser>): Promise<boolean> => {
    const exists = await isExist("id", id);
    if (!exists) return false;

    await db
        .update(usersTable)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(usersTable.id, id));

    return true;
};

// ✅ Delete user by ID
const deleteById = async (id: string): Promise<boolean> => {
    const exists = await isExist("id", id);
    if (!exists) return false;

    await db.delete(usersTable).where(eq(usersTable.id, id));
    return true;
};

// 📦 Export as a grouped object
export const UserService = {
    register,
    findAll,
    findById,
    findByEmail,
    updateById,
    deleteById,
    isExist,
};
