const { Chatroom, ChatroomMember, Message, User } = require('../models/index');
const { Op, Sequelize } = require('sequelize'); 

class ChatRepository {
    constructor() {
        this.Chatroom = Chatroom;
        this.ChatroomMember = ChatroomMember;
        this.Message = Message;
        this.User = User;
    }

    async findChatroomsByUserId(userId) {
        const chatrooms = await this.Chatroom.findAll({
            include: [{
                model: this.User,
                as: 'Members',
                through: { attributes: [] }, 
                where: { user_id: userId },
                required: true 
            }],
            order: [['created_at', 'DESC']]
        });
        return chatrooms;
    }

    async findMessagesByRoomId(roomId, limit = 50) {
        const messages = await this.Message.findAll({
            where: { room_id: roomId },
            include: [{
                model: this.User,
                as: 'Sender',
                attributes: ['user_id', 'nickname'] 
            }],
            order: [['created_at', 'ASC']],
            limit: limit,
        });
        return messages;
    }

    async createMessage(roomId, userId, content) {
        const newMessage = await this.Message.create({
            room_id: roomId,
            user_id: userId,
            content: content
        });
        
        const messageWithSender = await this.Message.findByPk(newMessage.message_id, {
            include: [{
                model: this.User,
                as: 'Sender',
                attributes: ['user_id', 'nickname']
            }]
        });

        return messageWithSender;
    }

    async createChatroom(roomName, userIds, creatorId) {
        const newRoom = await this.Chatroom.create({ 
            room_name: roomName,
            creator_id: creatorId 
        });
        
        const members = userIds.map(id => ({ room_id: newRoom.room_id, user_id: id }));
        await this.ChatroomMember.bulkCreate(members);

        return newRoom;
    }

    async isUserInRoom(roomId, userId) {
        const member = await this.ChatroomMember.findOne({
            where: { room_id: roomId, user_id: userId }
        });
        return !!member;
    }

    async findPopularChatrooms(limit = 10) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1); 

        try {
            const subQuery = await this.Message.findAll({
                attributes: [
                    'room_id',
                    [Sequelize.fn('COUNT', Sequelize.col('message_id')), 'message_count'] 
                ],
                where: { created_at: { [Op.gte]: oneDayAgo } },
                group: ['room_id'],
                order: [[Sequelize.literal('message_count'), 'DESC']],
                limit: limit,
                raw: true,
            });

            const popularRoomIds = subQuery.map(row => row.room_id);
            if (popularRoomIds.length === 0) return [];

            const chatrooms = await this.Chatroom.findAll({
                where: { room_id: { [Op.in]: popularRoomIds } }
            });

            const popularChatrooms = chatrooms.map(room => {
                const countRow = subQuery.find(row => row.room_id === room.room_id);
                return {
                    room_id: room.room_id,
                    room_name: room.room_name,
                    message_count: countRow ? parseInt(countRow.message_count, 10) : 0,
                };
            }).sort((a, b) => b.message_count - a.message_count);

            return popularChatrooms; 
        } catch (error) {
            console.error("인기 채팅방 쿼리 실패:", error.message);
            return []; 
        }
    }

    // ⭐️ [삭제됨] findPrivateRoomByUsers 메서드 제거 완료

    async findChatroomById(roomId) {
        return await this.Chatroom.findByPk(roomId);
    }

    async deleteChatroom(roomId) {
        await this.Chatroom.destroy({ where: { room_id: roomId } });
    }

    async addMember(roomId, userId) {
        const existing = await this.ChatroomMember.findOne({ where: { room_id: roomId, user_id: userId } });
        if (!existing) {
            await this.ChatroomMember.create({ room_id: roomId, user_id: userId });
        }
    }
}

module.exports = new ChatRepository();