// ⭐️ 관리자 전용 서비스 ⭐️
// (기존 Repository들을 가져와서 사용)
const postRepository = require('../repositories/post.repository');
const chatRepository = require('../repositories/chat.repository');
const authRepository = require('../repositories/auth.repository');
const NotFoundError = require('../errors/notFound.error');

class AdminService {

    // 1. 관리자 게시물 삭제 (권한 검사 없음)
    async adminDeletePost(postId) {
        // Service가 아닌 Repository에서 게시물을 조회해야 함 (구조 일관성)
        const post = await postRepository.findPostById(postId);
        if (!post) {
            throw new NotFoundError('삭제할 게시물을 찾을 수 없습니다.');
        }

        // ⭐️ 소유자(userId)를 확인하지 않고 바로 삭제
        // [수정] postRepository.deletePost(postId); -> postRepository.Post.destroy(...)
        // post.repository.js의 delete 함수는 소유권 검사를 하므로,
        // 관리자는 Post 모델에 직접 destroy 명령을 내려야 합니다.
        await postRepository.Post.destroy({ where: { post_id: postId } });
    }

    // 2. 관리자 채팅방 삭제 (권한 검사 없음)
    async adminDeleteChatroom(roomId) {
        const room = await chatRepository.Chatroom.findByPk(roomId);
        if (!room) {
            throw new NotFoundError('삭제할 채팅방을 찾을 수 없습니다.');
        }
        
        // ⭐️ 소유자(userId)를 확인하지 않고 바로 삭제
        // (채팅방 삭제는 연관된 ChatroomMember, Message 레코드도 정리해야 함 - ON DELETE CASCADE 설정 권장)
        await chatRepository.Chatroom.destroy({ where: { room_id: roomId } });
    }

    // 3. 사용자 계정 상태 변경
    async updateUserStatus(userId, status) {
        const user = await authRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError('상태를 변경할 사용자를 찾을 수 없습니다.');
        }
        
        // ⭐️ Repository를 통해 'status' 컬럼 업데이트
        // [수정] authRepository.updateUser -> authRepository.adminUpdateUser
        // (updateUser는 nickname/password용, adminUpdateUser가 status/role 등 범용)
        await authRepository.adminUpdateUser(userId, { status: status });
    }
}

module.exports = new AdminService();