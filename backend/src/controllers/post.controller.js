const postService = require('../services/post.service');
const ValidationError = require('../errors/validation.error');
const NotFoundError = require('../errors/notFound.error');
const ForbiddenError = require('../errors/forbidden.error');

// ⭐️ "공지사항" 게시판의 ID를 상수로 정의 (예: 4번)
const ANNOUNCEMENT_BOARD_ID = 4;
const DEFAULT_LIMIT = 10; // 🟢 [추가] 페이지당 기본 항목 수 설정 (10개)

class PostController {
    // 1. 게시물 목록 조회 (페이지네이션 적용)
    async getAllPosts(req, res) {
        // ⭐️ [수정] 쿼리 파라미터로 검색어(search_query)와 제외할 게시판(exclude_board_id) 받기
        const boardIdFilter = req.query.board_id ? Number(req.query.board_id) : null; 
        const searchQuery = req.query.search_query || null;
        const excludeBoardId = req.query.exclude_board_id ? Number(req.query.exclude_board_id) : null;
        
        // 🟢 [추가] 페이지네이션 파라미터 받기 (쿼리 파라미터가 없으면 page=1, limit=10)
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : DEFAULT_LIMIT;

        // ⭐️ 서비스 호출 시 모든 파라미터 전달 (page, limit 추가)
        // ⚠️ 주의: postService.getAllPosts는 이제 { posts, totalCount, totalPages, currentPage, limit } 객체를 반환한다고 가정합니다.
        const data = await postService.getAllPosts(boardIdFilter, searchQuery, excludeBoardId, page, limit);

        // 🟢 [수정] 서비스가 반환하는 전체 페이지네이션 데이터를 반환
        res.status(200).json({ 
            success: true, 
            data: data.posts, // 실제 게시물 목록
            pagination: {
                totalCount: data.totalCount, // 전체 게시물 수
                totalPages: data.totalPages, // 전체 페이지 수
                currentPage: data.currentPage, // 현재 페이지
                limit: data.limit // 페이지당 항목 수
            }
        });
    }

    // 2. 게시물 상세 조회
    async getPostDetails(req, res) {
        const postId = Number(req.params.id); 
        if (isNaN(postId) || postId <= 0) {
            throw new ValidationError('유효하지 않은 게시물 ID입니다.');
        }
        const details = await postService.getPostDetails(postId);
        res.status(200).json({ 
            success: true, 
            post: details.post, 
            comments: details.comments 
        }); 
    }

    // 3. 게시물 작성 (⭐️ 'image_url' 저장 방식 수정)
    async createPost(req, res) {
        // 1. auth.middleware.js가 req.user에 role을 넣어줍니다.
        const { user_id, role } = req.user; 
        
        const { title, content, board_id } = req.body;
        
        // ⭐️ [수정] req.file.path -> req.file.filename
        // DB에는 'uploads/' 경로를 제외한 '순수 파일명'만 저장합니다.
        const image_url = req.file ? req.file.filename : null;
        
        const numericBoardId = Number(board_id); // ⭐️ board_id를 숫자로 변환

        if (!title || !content || !numericBoardId) {
            throw new ValidationError('제목, 내용, 게시판 ID는 필수 입력 항목입니다.');
        }

        // ⭐️ 2. [관리자 권한 검사]
        // 선택한 게시판이 "공지사항" ID인데, 사용자가 "ADMIN"이 아니라면
        if (numericBoardId === ANNOUNCEMENT_BOARD_ID && role !== 'ADMIN') {
            throw new ForbiddenError('공지사항은 관리자만 작성할 수 있습니다.');
        }

        // 3. 서비스 호출
        const postId = await postService.createPost(title, content, user_id, numericBoardId, image_url);
        
        res.status(201).json({ 
            success: true,
            message: 'Post created successfully!',
            postId: postId,
            image_url: image_url // ⭐️ 저장된 파일명 반환 (선택 사항)
        });
    }

    // 4. 게시물 수정 (⭐️ 'image_url', board_id 처리 로직 수정)
    async updatePost(req, res) {
        const postId = Number(req.params.id);
        const loggedInUserId = req.user.user_id; 
        const loggedInUserRole = req.user.role; // ⭐️ 관리자 권한 확인용

        // 🟢 [핵심 수정] req.body에서 board_id를 명시적으로 받습니다.
        const { title, content, image_url_removed, board_id } = req.body; 

        // ⭐️ board_id를 숫자로 변환합니다.
        const numericBoardId = board_id !== undefined ? Number(board_id) : undefined;

        if (!title || !content) {
            throw new ValidationError('제목과 내용은 필수 입력 항목입니다.');
        }

        // ⭐️ [신규] 수정 시 공지사항 권한 검사 (프론트엔드 로직을 백엔드에서 재검증)
        if (numericBoardId === ANNOUNCEMENT_BOARD_ID && loggedInUserRole !== 'ADMIN') {
            throw new ForbiddenError('공지사항은 관리자만 수정할 수 있습니다.');
        }

        // --- ⭐️ 이미지 업데이트 로직 시작 ⭐️ ---
        let imageFileUpdate = undefined; // undefined: 이미지 변경 없음

        if (req.file) {
            // 1. 새 파일이 업로드된 경우: 새 파일명으로 교체
            imageFileUpdate = req.file.filename; 
        } else if (image_url_removed === 'true') {
            // 2. 새 파일은 없지만 'X' 버튼을 누른 경우: null로 (이미지 삭제)
            imageFileUpdate = null; 
        }
        // 3. 둘 다 아니면: imageFileUpdate는 undefined로 유지 (기존 이미지 유지)
        // --- ⭐️ 이미지 업데이트 로직 끝 ⭐️ ---


        // ⭐️ [수정] postService.updatePost로 role과 board_id를 전달
        await postService.updatePost(
            postId, 
            title, 
            content, 
            loggedInUserId, 
            imageFileUpdate,
            numericBoardId, // 🟢 [핵심] 업데이트할 board_id 전달
            loggedInUserRole 
        ); 
        
        res.status(200).json({ 
            success: true,
            message: `게시물 ID ${postId}가 성공적으로 수정되었습니다.` 
        });
    }

    // 5. 게시물 삭제 (⭐️ 권한 검사 로직 수정)
    async deletePost(req, res) {
        const postId = Number(req.params.id);
        const loggedInUserId = req.user.user_id; 
        const loggedInUserRole = req.user.role; // ⭐️ 관리자 권한 확인용
        
        // ⭐️ [수정] postService.deletePost로 role도 전달
        await postService.deletePost(postId, loggedInUserId, loggedInUserRole);
        
        res.status(200).json({ 
            success: true,
            message: `게시물 ID ${postId}가 성공적으로 삭제되었습니다.` 
        });
    }

    // --- (댓글 로직) ---

    // 6. 댓글 작성 
    async createComment(req, res) {
        const postId = Number(req.params.postId);
        const { content } = req.body;
        const user_id = req.user.user_id; 
        
        if (!content) {
            throw new ValidationError('댓글 내용은 필수 항목입니다.');
        }

        const commentData = await postService.createComment(postId, content, user_id);
        
        res.status(201).json({
            success: true,
            message: 'Comment created successfully!',
            data: commentData
        });
    }

    // 7. 댓글 수정
    async updateComment(req, res) {
        const commentId = Number(req.params.commentId);
        const { content } = req.body;
        const loggedInUserId = req.user.user_id;

        if (!content || content.trim() === '') {
            throw new ValidationError('댓글 내용은 비어 있을 수 없습니다.');
        }
        
        await postService.updateComment(commentId, content, loggedInUserId);

        res.status(200).json({
            success: true,
            message: `댓글 ID ${commentId}가 성공적으로 수정되었습니다.`
        });
    }

    // 8. 댓글 삭제
    async deleteComment(req, res) {
        const commentId = Number(req.params.commentId);
        const loggedInUserId = req.user.user_id; 

        await postService.deleteComment(commentId, loggedInUserId);
        
        res.status(200).json({ 
            success: true,
            message: `댓글 ID ${commentId}가 성공적으로 삭제되었습니다.` 
        });
    }

    // 9. 최신 댓글 목록 조회 (위젯용)
    async getRecentComments(req, res) {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const comments = await postService.getRecentComments(limit);
        
        res.status(200).json({
            success: true,
            data: comments
        });
    }
}

module.exports = new PostController();