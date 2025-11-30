const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        
        // ⭐️ [수정] DB와 일치하도록 'role' 컬럼 정의
        role: {
            type: DataTypes.ENUM('USER', 'ADMIN'),
            allowNull: false,
            defaultValue: 'USER'
        },
        
        // ⭐️ [수정] DB와 일치하도록 'status' 컬럼 정의
        status: {
            type: DataTypes.ENUM('ACTIVE', 'SUSPENDED'),
            allowNull: false,
            defaultValue: 'ACTIVE'
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user', // 테이블 이름 설정
        timestamps: false
    });
    
    return User;
};