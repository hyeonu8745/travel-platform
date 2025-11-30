const { DataTypes } = require('sequelize');

// ⭐️ 1. sequelize를 require로 가져오지 않고, 파라미터로 받도록 함수로 감쌉니다.
module.exports = (sequelize) => {
    
    const Trip = sequelize.define('Trip', {
        trip_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'trips',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Trip; // ⭐️ 모델 반환
};
