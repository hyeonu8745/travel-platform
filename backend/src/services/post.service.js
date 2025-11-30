const postRepository = require('../repositories/post.repository');
const NotFoundError = require('../errors/notFound.error');
const ForbiddenError = require('../errors/forbidden.error');

class PostService {
    // 1. 모든 게시글 조회 (필터링 및 페이지네이션 적용)
    // 🟢 [수정] page와 limit 인수를 추가합니다.
    async getAllPosts(boardIdFilter, searchQuery, excludeBoardId, page, limit) {
        
        // 🟢 [추가] DB에서 건너뛸 항목 수(offset) 계산
        const offset = (page - 1) * limit; 

        // 🟢 [수정] Repository에 page, limit, offset 전달 및 totalCount를 받습니다.
        const { posts, totalCount } = await postRepository.findAllPosts(
            boardIdFilter, searchQuery, excludeBoardId, limit, offset
        );

        // 🟢 [추가] 총 페이지 수 계산
        const totalPages = Math.ceil(totalCount / limit);
        
        return { 
            posts, 
            totalCount, 
            totalPages, 
            currentPage: page, 
            limit 
        };
    }

    // 2. 게시물 상세 조회
    async getPostDetails(postId) {
        const post = await postRepository.findPostById(postId); 
        
        if (!post) {
            throw new NotFoundError('요청한 게시물');
        }
        
        return { post: post.get({ plain: true }), comments: post.Comments || [] }; 
    }

    // 3. 게시물 생성 (image_url 추가)
    async createPost(title, content, user_id, board_id, image_url) { // ⬅️ image_url 인수 추가
        const postId = await postRepository.create(title, content, user_id, board_id, image_url); // ⬅️ 전달
        return postId;
    }

    // 4. 게시물 수정 (image_url, board_id 추가)
    // 🟢 [핵심 수정] board_id를 명시적으로 받도록 인자 순서 변경 및 추가
    async updatePost(postId, title, content, loggedInUserId, image_url, board_id, userRole) { 
        
        // 🟢 [핵심 수정] board_id를 Repository로 전달
        const result = await postRepository.update(postId, title, content, loggedInUserId, image_url, board_id, userRole); 
        
        if (!result.isOwnerOrAdmin) { // ⭐️ isOwner -> isOwnerOrAdmin
            throw new ForbiddenError('게시물 수정');
        }
        
        return true;
    }

    // 5. 게시물 삭제
    // ⭐️ [수정] userRole 인자 추가
    async deletePost(postId, loggedInUserId, userRole) {
        const result = await postRepository.delete(postId, loggedInUserId, userRole);

        if (!result.isOwnerOrAdmin) { // ⭐️ isOwner -> isOwnerOrAdmin
            throw new ForbiddenError('게시물 삭제');
        }
        
        return true;
    }

    // 6. 댓글 작성
    async createComment(postId, content, userId) {
        const commentData = await postRepository.createComment(postId, userId, content);
        return postRepository.findCommentById(commentData);
    }

    // 7. ⭐️ 새 기능: 댓글 수정 ⭐️
    async updateComment(commentId, content, loggedInUserId) {
        const result = await postRepository.updateComment(commentId, content, loggedInUserId);
        
        if (!result.isOwner) {
            throw new ForbiddenError('댓글 수정');
        }
        
        return true;
    }

    // 8. 댓글 삭제
    async deleteComment(commentId, loggedInUserId) {
        const result = await postRepository.deleteComment(commentId, loggedInUserId);
        
        if (!result.isOwner) {
            throw new ForbiddenError('댓글 삭제');
        }
        
        return true;
    }

    // 9. ⭐️ 새 기능: 최신 댓글 목록 조회 (위젯용) ⭐️
    async getRecentComments(limit) {
        return postRepository.findRecentComments(limit);
    }
}

module.exports = new PostService();