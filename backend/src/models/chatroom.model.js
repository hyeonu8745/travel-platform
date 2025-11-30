const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Chatroom = sequelize.define('Chatroom', {
        room_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        room_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // ⭐️ [신규] 방장(생성자) ID 추가
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: true // 기존 데이터 호환을 위해 일단 true (새 방은 값이 들어감)
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'chatroom',
        timestamps: false
    });
    
    return Chatroom;
};