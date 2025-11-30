const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        post_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        
        // ⭐️ [신규] image_url 컬럼 정의 추가
        image_url: {
            type: DataTypes.STRING(255), // DB와 일치하는 타입
            allowNull: true // 이미지는 선택 사항
        },

        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // user_id와 board_id는 관계 설정을 통해 자동으로 추가됩니다.
    }, {
        tableName: 'post',
        timestamps: false
    });
    
    return Post;
};