const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller');
// ⭐️ [수정] '../middlewares/auth' -> '../middlewares/auth.middleware'
const auth = require('../middlewares/auth.middleware'); 
const asyncHandler = require('../middlewares/async.handler'); 
const uploadImage = require('../middlewares/upload.middleware'); 

// ----------------------------------------------------
// ⭐️ 공개 API (인증 미들웨어 제거)
// ----------------------------------------------------

router.route('/')
    // ⭐️ 'auth.authenticateToken' 제거 (로그아웃 상태에서도 목록 조회 허용)
    .get(asyncHandler(postController.getAllPosts)) 
    // ⭐️ 글쓰기는 인증 유지
    .post(auth.authenticateToken, uploadImage, asyncHandler(postController.createPost)); 

// ⭐️ 최신 댓글 조회 라우트 (위젯용)
// ⭐️ 'auth.authenticateToken' 제거 (로그아웃 상태에서도 위젯 데이터 허용)
router.get('/comments/recent', asyncHandler(postController.getRecentComments)); 

router.route('/:id')
    // ⭐️ 'auth.authenticateToken' 제거 (로그아웃 상태에서도 상세 조회 허용)
    .get(asyncHandler(postController.getPostDetails)) 
    // ⭐️ 수정 및 삭제는 인증 유지
    .put(auth.authenticateToken, uploadImage, asyncHandler(postController.updatePost)) 
    .delete(auth.authenticateToken, asyncHandler(postController.deletePost)); 

// ----------------------------------------------------
// ⭐️ 인증 필요한 API (인증 미들웨어 유지)
// ----------------------------------------------------

// 댓글 관련 라우트
router.route('/:postId/comments')
    .post(auth.authenticateToken, asyncHandler(postController.createComment)); // 댓글 작성

router.route('/:postId/comments/:commentId')
    .put(auth.authenticateToken, asyncHandler(postController.updateComment)) // 댓글 수정
    .delete(auth.authenticateToken, asyncHandler(postController.deleteComment)); // 댓글 삭제

module.exports = router;