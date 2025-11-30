const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ChatroomMember = sequelize.define('ChatroomMember', {
        // room_id와 user_id가 복합 기본 키 역할을 수행합니다.
        room_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        }
    }, {
        tableName: 'chatroommember',
        timestamps: false,
        // 복합 기본 키 설정
        indexes: [
            {
                unique: true,
                fields: ['room_id', 'user_id']
            }
        ]
    });
    
    return ChatroomMember;
};