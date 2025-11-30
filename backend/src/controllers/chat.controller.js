const chatService = require('../services/chat.service');
const ValidationError = require('../errors/validation.error');

class ChatController {

    // 1. 채팅방 목록 조회
    async getChatrooms(req, res) {
        const userId = req.user.user_id;
        const chatrooms = await chatService.getChatrooms(userId);
        res.status(200).json({ success: true, data: chatrooms });
    }

    // 2. 채팅방 생성
    async createChatroom(req, res) {
        const userId = req.user.user_id;
        const { room_name } = req.body;
        if (!room_name || room_name.trim().length === 0) {
            throw new ValidationError('채팅방 이름은 필수입니다.');
        }
        const newRoom = await chatService.createChatroom(room_name, userId);
        res.status(201).json({ success: true, message: '생성 완료', data: newRoom });
    }

    // 3. 인기 채팅방 목록
    async getPopularChatrooms(req, res) {
        const popularRooms = await chatService.getPopularChatrooms();
        res.status(200).json({ success: true, data: popularRooms });
    }

    // 4. 채팅방 삭제
    async deleteChatroom(req, res) {
        const roomId = Number(req.params.id);
        const userId = req.user.user_id;
        const userRole = req.user.role;
        await chatService.deleteChatroom(roomId, userId, userRole);
        res.status(200).json({ success: true, message: '채팅방이 삭제되었습니다.' });
    }

    // 5. 사용자 초대
    async inviteUser(req, res) {
        const roomId = Number(req.params.id);
        const userId = req.user.user_id;
        const { nickname, targetUserId } = req.body;

        let invitedUser;
        if (targetUserId) {
            invitedUser = await chatService.inviteUserById(roomId, userId, targetUserId);
        } else if (nickname) {
            invitedUser = await chatService.inviteUser(roomId, userId, nickname);
        } else {
            throw new ValidationError('초대할 대상 정보가 없습니다.');
        }
        res.status(200).json({
            success: true,
            message: `${invitedUser.nickname}님을 초대했습니다.`
        });
    }

    // 6. 메시지 목록 조회
    async getMessages(req, res) {
        const chatroomId = Number(req.params.id);
        // 필요 시 req.user.user_id를 넘겨 권한 체크
        const messages = await chatService.getMessages(chatroomId);
        res.status(200).json({ success: true, data: messages });
    }

    // ⭐️ 7. [핵심 수정] 메시지 전송 (API 호출 시 소켓 알림 병행)
    async sendMessage(req, res) {
        const chatroomId = Number(req.params.id);
        const userId = req.user.user_id;
        const { content } = req.body;

        if (!content) throw new ValidationError('메시지 내용을 입력하세요.');

        // A. DB에 메시지 저장
        const message = await chatService.saveMessage(chatroomId, userId, content);

        // B. 실시간 소켓 전송 로직
        // server.js에서 set한 io 객체를 가져옵니다.
        const io = req.app.get('io');
        
        if (io) {
            // 클라이언트(안드로이드)가 기대하는 데이터 구조로 변환
            const messagePayload = {
                id: message.message_id,
                content: message.content,
                createdAt: message.created_at,
                sender: {
                    id: message.Sender ? message.Sender.user_id : userId,
                    // 닉네임이 populate 되어있지 않다면 req.user에서 가져옴
                    nickname: message.Sender ? message.Sender.nickname : req.user.nickname 
                }
            };

            // 해당 채팅방(Room)에 있는 모든 사람에게 'newMessage' 이벤트 발송
            // (주의: chatroomId는 joinRoom할 때 쓴 타입과 일치해야 함. 보통 숫자나 문자열 통일)
            io.to(chatroomId).emit('newMessage', messagePayload);
            
            console.log(`[API] 방(${chatroomId})에 메시지 전송 및 소켓 알림 완료`);
        } else {
            console.error('[API] IO 객체를 찾을 수 없습니다. (app.set 확인 필요)');
        }

        res.status(201).json({ success: true, data: message });
    }
}

module.exports = new ChatController();
