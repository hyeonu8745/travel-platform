const express = require('express');
const router = express.Router();

// 1. 기존 라우터 임포트
const authRouter = require('./auth.route');
const postRouter = require('./post.route');
const chatRouter = require('./chat.route'); 
// 2. ⭐️ [신규] 3단계에서 만든 관리자 라우터 불러오기
const adminRouter = require('./admin.routes'); 
const tripRouter = require('./trip.route');


// 3. /auth 경로 연결
router.use('/auth', authRouter);

// 4. /posts 경로 연결
router.use('/posts', postRouter);

// 5. /chat 경로 연결
router.use('/chatrooms', chatRouter); 

// 6. ⭐️ [신규] 관리자 전용 라우트 등록
// '/api/admin'으로 시작하는 모든 요청은 adminRouter로 보냅니다.
router.use('/admin', adminRouter); // ⭐️ ( /api/admin )

router.use('/trips', tripRouter);

module.exports = router;