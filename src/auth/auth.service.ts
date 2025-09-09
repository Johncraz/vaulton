// src/auth/auth.service.ts
import { UserService } from "@/user/user.service";
import { LoginInput } from "./auth.modal";
import { AuthenticationException } from "@/exception/Authentication";

const login = async (loginInput: LoginInput) => {
    const { email, password } = loginInput;

    // 🔍 Check if user exists
    const user = await UserService.findByEmail(email);
    if (!user) throw new AuthenticationException(`User not found with email: ${email}`, 404);

    // 🔐 Verify password
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) throw new AuthenticationException("Invalid credentials", 401);

    // ✅ Success — return user without sensitive data
    const { password: _, ...safeUser } = user;
    return safeUser;
};

export const AuthService = {
    login,
};
