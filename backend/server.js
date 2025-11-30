const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const db = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const chatService = require('./src/services/chat.service');
const { verifyToken } = require('./src/middlewares/auth.middleware');
const UnauthorizedError = require('./src/errors/unauthorized.error');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // 보안을 위해 배포 시 프론트엔드 도메인으로 제한 권장
        methods: ["GET", "POST"]
    }
});

// Express 앱 전역에서 io 객체를 사용할 수 있도록 설정
app.set('io', io);

// 1. Socket.io 인증 미들웨어
io.use(async (socket, next) => {
    const token = socket.handshake.query.token;
    try {
        if (!token) {
            return next(new UnauthorizedError("인증 토큰이 제공되지 않았습니다."));
        }
        const user = await verifyToken(token);
        socket.user = user;
        next();
    } catch (error) {
        console.error("Socket 인증 실패:", error.message);
        next(new UnauthorizedError("유효하지 않거나 만료된 토큰입니다."));
    }
});

// 2. 메인 Socket.io 이벤트 핸들러
io.on('connection', (socket) => {
    console.log(`[Socket Connected] User ID: ${socket.user.user_id}, Socket ID: ${socket.id}`);

    // A. 채팅방 입장 (join)
    socket.on('joinRoom', async (id) => {
        const userId = socket.user.user_id;
        const roomId = Number(id);
        
        try {
            await chatService.joinChatroom(roomId, userId);
            
            // ⭐️ [핵심 추가] 메시지 목록 조회 로직
            const messages = await chatService.getMessages(roomId, userId);
            
            // 메시지 데이터 포맷팅 (안전하게 변환)
            let messagePayloads = [];
            if (messages && messages.length > 0) {
                messagePayloads = messages.map(msg => {
                    const plainMsg = (typeof msg.toJSON === 'function') ? msg.toJSON() : msg;
                    const senderData = plainMsg.Sender || {};
                    return {
                        id: plainMsg.message_id,
                        content: plainMsg.content,
                        createdAt: plainMsg.created_at,
                        sender: {
                            id: senderData.user_id || plainMsg.user_id,
                            nickname: senderData.nickname || 'Unknown'
                        }
                    };
                });
            }

            socket.join(roomId); // 방 접속
            console.log(`User ${userId} joined room ${roomId}. Loaded ${messagePayloads.length} messages.`);
            
            // ⭐️ [핵심 수정] 메시지 목록도 함께 전송
            socket.emit('roomJoined', { 
                roomId, 
                messages: messagePayloads 
            });
            
            // 다른 사람들에게 알림
            socket.to(roomId).emit('notification', {
                type: 'join',
                message: `${socket.user.nickname}님이 입장했습니다.`
            });

        } catch (error) {
            console.error("joinRoom Error:", error);
            socket.emit('chatError', { message: error.message });
        }
    });

    // B. 소켓으로 직접 메시지 보낼 때
    socket.on('sendMessage', async ({ roomId: id, content }) => {
        const userId = socket.user.user_id;
        const roomId = Number(id);
        try {
            const savedMessage = await chatService.saveMessage(roomId, userId, content);
            const plainMessage = savedMessage.toJSON();

            const messagePayload = {
                id: plainMessage.message_id,
                content: plainMessage.content,
                createdAt: plainMessage.created_at,
                sender: {
                    id: plainMessage.Sender.user_id,
                    nickname: plainMessage.Sender.nickname
                },
            };
            
            io.to(roomId).emit('newMessage', messagePayload);

        } catch (error) {
            socket.emit('chatError', { message: error.message });
        }
    });

    // C. 연결 해제
    socket.on('disconnect', () => {
        console.log(`[Socket Disconnected] User ID: ${socket.user.user_id}`);
    });
});

// 서버 시작 함수
const startServer = async () => {
    await db.connectDB();
    const models = require('./src/models/index');
    const { Board } = models;

    await models.sequelize.sync({ alter: true });
    console.log("✅ 데이터베이스 동기화 완료.");

    try {
        const defaultBoards = [
            { board_id: 1, board_name: '자유 게시판' },
            { board_id: 2, board_name: '여행 후기' },
            { board_id: 3, board_name: '질문과 답변' },
            { board_id: 4, board_name: '📌 공지사항' },
        ];
        for (const board of defaultBoards) {
            await Board.findOrCreate({
                where: { board_id: board.board_id },
                defaults: { board_name: board.board_name }
            });
        }
        console.log('✅ 기본 게시판 데이터 확인/생성 완료.');
    } catch (error) {
        console.error('❌ 기본 게시판 생성 중 오류 발생:', error);
    }

    server.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`💬 Socket.io ready on port ${PORT}`);
    });
};

startServer();
