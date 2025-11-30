const chatRepository = require('../repositories/chat.repository');
const authRepository = require('../repositories/auth.repository'); 
const NotFoundError = require('../errors/notFound.error');
const ForbiddenError = require('../errors/forbidden.error');

class ChatService {
    
    // 1. 내 채팅방 목록 조회
    async getChatrooms(userId) {
        const chatrooms = await chatRepository.findChatroomsByUserId(userId);
        return chatrooms || [];
    }

    // 2. 메시지 목록 조회
    // (컨트롤러에서 userId를 안 넘겨줄 수도 있으므로 선택적으로 처리하거나, 방 멤버인지 확인)
    async getMessages(roomId, userId = null) {
        // userId가 넘어오면 멤버인지 확인 (보안 강화)
        if (userId) {
            const isMember = await chatRepository.isUserInRoom(roomId, userId);
            if (!isMember) throw new ForbiddenError('이 채팅방의 메시지를 볼 권한이 없습니다.');
        }
        
        return await chatRepository.findMessagesByRoomId(roomId);
    }

    // 3. 메시지 저장
    async saveMessage(roomId, userId, content) {
        const isMember = await chatRepository.isUserInRoom(roomId, userId);
        if (!isMember) throw new ForbiddenError('이 채팅방에 메시지를 보낼 권한이 없습니다.');
        
        return await chatRepository.createMessage(roomId, userId, content);
    }

    // 4. 그룹 채팅방 생성
    async createChatroom(roomName, creatorId) {
        const userIds = [creatorId];
        // Repository의 createChatroom 메서드가 (roomName, userIds, creatorId) 인자를 받는지 확인 필요
        const newRoom = await chatRepository.createChatroom(roomName, userIds, creatorId);
        return newRoom;
    }

    // 5. 인기 채팅방 목록
    async getPopularChatrooms() {
        return await chatRepository.findPopularChatrooms(10);
    }

    // 6. 채팅방 입장 (Join)
    async joinChatroom(roomId, userId) {
        const isMember = await chatRepository.isUserInRoom(roomId, userId);
        if (!isMember) {
            // Repository에 addMember 메서드가 있다면 그걸 쓰는 게 더 일관성 있음
            await chatRepository.addMember(roomId, userId);
        }
        return { success: true };
    }

    // 7. 채팅방 삭제
    async deleteChatroom(roomId, userId, userRole) {
        const room = await chatRepository.findChatroomById(roomId);
        if (!room) throw new NotFoundError('채팅방을 찾을 수 없습니다.');

        const isCreator = room.creator_id === userId;
        const isAdmin = userRole === 'ADMIN';

        if (!isCreator && !isAdmin) {
            throw new ForbiddenError('방장 또는 관리자만 방을 삭제할 수 있습니다.');
        }

        await chatRepository.deleteChatroom(roomId);
        return true;
    }

    // 8. 닉네임으로 사용자 초대 (웹용)
    async inviteUser(roomId, inviterId, targetNickname) {
        const isMember = await chatRepository.isUserInRoom(roomId, inviterId);
        if (!isMember) throw new ForbiddenError('초대 권한이 없습니다.');

        const targetUser = await authRepository.findUserByNickname(targetNickname);
        if (!targetUser) throw new NotFoundError(`닉네임 '${targetNickname}'을(를) 가진 사용자를 찾을 수 없습니다.`);

        // 이미 멤버인지 확인
        const isTargetMember = await chatRepository.isUserInRoom(roomId, targetUser.user_id);
        if (isTargetMember) {
            throw new ForbiddenError('이미 채팅방에 참여 중인 사용자입니다.');
        }

        await chatRepository.addMember(roomId, targetUser.user_id);
        
        return targetUser; 
    }

    // ⭐️ 9. [추가] ID로 사용자 초대 (안드로이드 앱용)
    async inviteUserById(roomId, inviterId, targetUserId) {
        const isMember = await chatRepository.isUserInRoom(roomId, inviterId);
        if (!isMember) throw new ForbiddenError('초대 권한이 없습니다.');

        const targetUser = await authRepository.findUserById(targetUserId); // AuthRepository에 이 메서드 필요
        if (!targetUser) throw new NotFoundError('사용자를 찾을 수 없습니다.');

        const isTargetMember = await chatRepository.isUserInRoom(roomId, targetUserId);
        if (isTargetMember) {
            throw new ForbiddenError('이미 채팅방에 참여 중인 사용자입니다.');
        }

        await chatRepository.addMember(roomId, targetUserId);

        return targetUser;
    }
}

module.exports = new ChatService();
