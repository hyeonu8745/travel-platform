const express = require('express');
const router = express.Router();

// 🚨 Controller 임포트
const authController = require('../controllers/auth.controller'); 

// ⭐️ [수정] '../middlewares/auth' -> '../middlewares/auth.middleware'
const { authenticateToken } = require('../middlewares/auth.middleware'); 
const asyncHandler = require('../middlewares/async.handler'); // ⬅️ asyncHandler 임포트 가정

// ----------------------------------------------------
// 인증 라우트 (인증 미들웨어가 필요 없는 경로)
// ----------------------------------------------------

// 1. 회원가입 API: POST /api/auth/register
router.post('/register', asyncHandler(authController.register));

// 2. 로그인 API: POST /api/auth/login
router.post('/login', asyncHandler(authController.login));


// ----------------------------------------------------
// 인증 필요 라우트 (authenticateToken 미들웨어 적용)
// ----------------------------------------------------

// 3. ⭐️ 총 사용자 수 조회 API (위젯용) ⭐️
// GET /api/auth/users/count
router.get('/users/count', authenticateToken, asyncHandler(authController.getTotalUserCount));

// 4. 프로필 조회 API (인증 필요)
router.get('/profile', authenticateToken, asyncHandler(authController.getProfile)); 

// 5. 사용자 정보 수정 및 삭제 (파라미터 사용)
router.put('/users/:id', authenticateToken, asyncHandler(authController.updateUser)); 
router.delete('/users/:id', authenticateToken, asyncHandler(authController.deleteUser)); 

// ⭐️ 6. 새 기능: 1:1 채팅을 위한 사용자 목록 조회 ⭐️
// GET /api/auth/users/list
router.get('/users/list', authenticateToken, asyncHandler(authController.getAllUsers));

// ⭐️ 7. [신규 추가] 사용자 검색 API (초대 모달용)
// GET /api/auth/search?query=닉네임
router.get('/search', authenticateToken, asyncHandler(authController.searchUsers));


module.exports = router;