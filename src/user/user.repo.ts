import { db } from "@/database"
import { insertUser, usersTable } from "@/database/schema/users"


export const registerUser = async (user: insertUser) => {

    await db.insert(usersTable).values({
        fullName: user.fullName,
        email: user.email,
        password: user.password,
    })

}