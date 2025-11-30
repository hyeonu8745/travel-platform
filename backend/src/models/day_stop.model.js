const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DayStop = sequelize.define('DayStop', {
        stop_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        stop_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '방문 순서'
        },
        location_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8), // 정밀한 위도 저장
            allowNull: false
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8), // 정밀한 경도 저장
            allowNull: false
        },
        memo: {
            type: DataTypes.TEXT,
            allowNull: true
        }
        // day_id는 관계 설정을 통해 자동 추가됩니다.
    }, {
        tableName: 'day_stops',
        timestamps: false
    });
    
    return DayStop;
};