// ⭐️ 관리자 전용 컨트롤러 ⭐️
const adminService = require('../services/admin.service');
const authService = require('../services/auth.service'); // ⭐️ AuthService 추가
const ValidationError = require('../errors/validation.error');

class AdminController {

    // DELETE /api/admin/posts/:postId
    async adminDeletePost(req, res) {
        const postId = Number(req.params.postId);
        if (isNaN(postId)) throw new ValidationError("유효하지 않은 게시물 ID입니다.");
        
        await adminService.adminDeletePost(postId);
        
        res.status(200).json({ 
            success: true, 
            message: `(관리자) 게시물 ID ${postId}가 강제 삭제되었습니다.` 
        });
    }

    // DELETE /api/admin/chatrooms/:roomId
    async adminDeleteChatroom(req, res) {
        const roomId = Number(req.params.roomId);
        if (isNaN(roomId)) throw new ValidationError("유효하지 않은 채팅방 ID입니다.");

        await adminService.adminDeleteChatroom(roomId);

        res.status(200).json({ 
            success: true, 
            message: `(관리자) 채팅방 ID ${roomId}가 강제 삭제되었습니다.` 
        });
    }

    // PUT /api/admin/users/:userId/suspend
    async suspendUser(req, res) {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) throw new ValidationError("유효하지 않은 사용자 ID입니다.");

        await adminService.updateUserStatus(userId, 'SUSPENDED');
        
        res.status(200).json({ 
            success: true, 
            message: `사용자 ID ${userId}의 계정이 '이용 정지' 처리되었습니다.` 
        });
    }

    // PUT /api/admin/users/:userId/activate
    async activateUser(req, res) {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) throw new ValidationError("유효하지 않은 사용자 ID입니다.");

        await adminService.updateUserStatus(userId, 'ACTIVE');
        
        res.status(200).json({ 
            success: true, 
            message: `사용자 ID ${userId}의 계정이 '정상' 처리되었습니다.` 
        });
    }

    // ⭐️ [신규] GET /api/admin/users/all
    async getAllUsersForAdmin(req, res) {
        const currentUserId = req.user.user_id; // 관리자 본인 ID
        
        // ⭐️ AuthService에서 새 함수 호출
        const users = await authService.getAllUsersForAdmin(currentUserId);

        res.status(200).json({
            success: true,
            data: users 
        });
    }
}

module.exports = new AdminController();