const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller'); 
const { authenticateToken } = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/async.handler'); 

// 전제 조건: app.js에서 app.use('/api/chatrooms', chatRouter); 로 연결되어 있어야 함

// 1. 채팅방 목록 조회 (GET /api/chatrooms)
// 기존 '/rooms' -> '/' 로 변경
router.get('/', authenticateToken, asyncHandler(chatController.getChatrooms));

// 2. 그룹 채팅방 생성 (POST /api/chatrooms)
// 기존 '/rooms' -> '/' 로 변경
router.post('/', authenticateToken, asyncHandler(chatController.createChatroom)); 

// 3. 인기 채팅방 목록 (GET /api/chatrooms/popular)
// 기존 '/rooms/popular' -> '/popular' 로 변경
router.get('/popular', asyncHandler(chatController.getPopularChatrooms));

// ⭐️ [추가] 4. 메시지 목록 조회 (GET /api/chatrooms/:id/messages)
// 안드로이드 ChatDetailActivity에서 사용함
router.get('/:id/messages', authenticateToken, asyncHandler(chatController.getMessages));

// ⭐️ [추가] 5. 메시지 전송 (POST /api/chatrooms/:id/messages)
// 안드로이드 ChatDetailActivity에서 사용함
router.post('/:id/messages', authenticateToken, asyncHandler(chatController.sendMessage));

// 6. 채팅방 삭제 (DELETE /api/chatrooms/:id)
// 기존 '/rooms/:roomId' -> '/:id' 로 변경 (id 파라미터 통일 권장)
router.delete('/:id', authenticateToken, asyncHandler(chatController.deleteChatroom));

// 7. 사용자 초대 (POST /api/chatrooms/:id/invite)
// 기존 '/rooms/:roomId/invite' -> '/:id/invite' 로 변경
router.post('/:id/invite', authenticateToken, asyncHandler(chatController.inviteUser));

module.exports = router;
