// src/models/index.js
const { Sequelize } = require('sequelize');
const db = require('../config/db');
const sequelize = db.sequelize;

// 1. 기본 모델 로드
const User = require('./user.model')(sequelize);
const Board = require('./board.model')(sequelize); // ⭐️ Board 모델 확인
const Post = require('./post.model')(sequelize);
const Comment = require('./comment.model')(sequelize);

// 2. 채팅 관련 모델 로드
const Chatroom = require('./chatroom.model')(sequelize);
const ChatroomMember = require('./chatroomMember.model')(sequelize);
const Message = require('./message.model')(sequelize);

// 3. 여행 관련 모델 로드
const Trip = require('./trip.model')(sequelize);
const TripDay = require('./trip_day.model')(sequelize);
const DayStop = require('./day_stop.model')(sequelize);


// ==========================================================
// ⭐️ 모델 관계 설정 (Association)
// ==========================================================

// 1. User <-> Post
User.hasMany(Post, { foreignKey: 'user_id', as: 'Posts', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

// 2. Board <-> Post
Board.hasMany(Post, { foreignKey: 'board_id', as: 'Posts', onDelete: 'CASCADE' });
Post.belongsTo(Board, { foreignKey: 'board_id', as: 'Board' });

// 3. User <-> Comment
User.hasMany(Comment, { foreignKey: 'user_id', as: 'Comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'CommentAuthor' });

// 4. Post <-> Comment
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'Comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'Post' });


// --- 채팅 관계 설정 ---

// 5. Chatroom <-> Message
Chatroom.hasMany(Message, { foreignKey: 'room_id', as: 'Messages', onDelete: 'CASCADE' });
Message.belongsTo(Chatroom, { foreignKey: 'room_id', as: 'Chatroom' });

// 6. User <-> Message (작성자)
User.hasMany(Message, { foreignKey: 'user_id', as: 'SentMessages', onDelete: 'CASCADE' }); 
Message.belongsTo(User, { foreignKey: 'user_id', as: 'Sender' }); 

// 7. Chatroom <-> User (N:M 참여자)
Chatroom.belongsToMany(User, { through: ChatroomMember, foreignKey: 'room_id', as: 'Members', onDelete: 'CASCADE' });
User.belongsToMany(Chatroom, { through: ChatroomMember, foreignKey: 'user_id', as: 'JoinedRooms', onDelete: 'CASCADE' });

// 8. ChatroomMember 직접 관계
ChatroomMember.belongsTo(Chatroom, { foreignKey: 'room_id', onDelete: 'CASCADE' }); 
ChatroomMember.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' }); 


// --- 여행 관계 설정 ---

// 9. User <-> Trip
User.hasMany(Trip, { foreignKey: 'user_id', as: 'Trips', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

// 10. Trip <-> TripDay
Trip.hasMany(TripDay, { foreignKey: 'trip_id', as: 'Days', onDelete: 'CASCADE' });
TripDay.belongsTo(Trip, { foreignKey: 'trip_id', as: 'Trip' });

// 11. TripDay <-> DayStop
TripDay.hasMany(DayStop, { foreignKey: 'day_id', as: 'Stops', onDelete: 'CASCADE' });
DayStop.belongsTo(TripDay, { foreignKey: 'day_id', as: 'Day' });


// ==========================================================
// ⭐️ 모델 객체 내보내기
// ==========================================================
const models = {
    User,
    Board,
    Post,
    Comment,
    Chatroom,
    ChatroomMember,
    Message,
    Trip,
    TripDay,
    DayStop,
    sequelize
};

// db 객체에 모델 할당 (호환성 유지)
Object.keys(models).forEach(modelName => {
    db[modelName] = models[modelName];
});

module.exports = models;