const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TripDay = sequelize.define('TripDay', {
        day_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        day_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'N일차 (1, 2, 3...)'
        },
        trip_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
        // trip_id는 관계 설정을 통해 자동 추가됩니다.
    }, {
        tableName: 'trip_days',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['trip_id', 'day_index'] // 한 여행 내 day_index 중복 방지
            }
        ]
    });
    
    return TripDay;
};