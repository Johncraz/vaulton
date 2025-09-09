// src/database/defaultSeeds.ts

import { UserService } from "@/user/user.service";
import logger from "@/utils/logger";

export const seedDefaultUser = async () => {
    const defaultUser = {
        fullName: "Administrator",
        email: "admin@admin.com",
        password: "Admin@123", // will be hashed in User.register
    };

    const exists = await UserService.isExist("email", defaultUser.email);

    if (!exists) {
        await UserService.register(defaultUser);
        logger.success(`✅ Default user '${defaultUser.email}' created.`);
    } else {
        logger.info(`ℹ️  Default user '${defaultUser.email}' already exists.`);
    }
};
