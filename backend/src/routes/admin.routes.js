// ⭐️ 관리자 전용 API 라우트 ⭐️
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, checkAdmin } = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/async.handler');

// ----------------------------------------------------
// [중요] 이 파일의 모든 라우트는 /api/admin으로 시작하며,
// 관리자(ADMIN) 권한이 있는지 이중으로 확인합니다.
// ----------------------------------------------------

// 1. 관리자 - 게시물 강제 삭제
router.delete(
    '/posts/:postId',
    authenticateToken, // 1. 로그인 확인
    checkAdmin,        // 2. 관리자 확인
    asyncHandler(adminController.adminDeletePost)
);

// 2. 관리자 - 채팅방 강제 삭제
router.delete(
    '/chatrooms/:roomId',
    authenticateToken,
    checkAdmin,
    asyncHandler(adminController.adminDeleteChatroom)
);

// 3. 관리자 - 사용자 계정 정지
router.put(
    '/users/:userId/suspend',
    authenticateToken,
    checkAdmin,
    asyncHandler(adminController.suspendUser)
);

// 4. 관리자 - 사용자 계정 활성화
router.put(
    '/users/:userId/activate',
    authenticateToken,
    checkAdmin,
    asyncHandler(adminController.activateUser)
);

// ⭐️ [신규] 5. 관리자 - 전체 사용자 목록 조회 (정지된 사용자 포함)
router.get(
    '/users/all',
    authenticateToken,
    checkAdmin,
    asyncHandler(adminController.getAllUsersForAdmin)
);

module.exports = router;