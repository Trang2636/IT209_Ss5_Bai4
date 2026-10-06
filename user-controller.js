/**
 * User Controller - Module quản lý thông tin tài khoản người dùng
 */

class UserController {
    constructor() {
        this.users = [
            {
                id: 1,
                username: "nguyenvana",
                email: "vana@example.com",
                passwordHash: "$2a$12$e80MvQk7V/...",
                role: "admin",
                token: "secret_admin_token_xyz"
            },
            {
                id: 2,
                username: "tranthib",
                email: "thib@example.com",
                passwordHash: "$2a$12$z91KaLm8W/...",
                role: "user",
                token: "secret_user_token_abc"
            }
        ];
    }

    /**
     * [HOTFIX v1.0.1] Đã loại bỏ các trường nhạy cảm (passwordHash, token)
     * Tránh lỗi nghiêm trọng rò rỉ dữ liệu người dùng ra môi trường Production
     */
    getUserProfile(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { error: "Không tìm thấy người dùng" };
        }

        // BẢN VÁ BẢO MẬT: Chỉ trả về thông tin công khai
        const { passwordHash, token, ...safeUserProfile } = user;
        return {
            success: true,
            data: safeUserProfile
        };
    }
}

module.exports = UserController;
