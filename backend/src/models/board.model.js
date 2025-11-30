const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Board = sequelize.define('Board', {
        board_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        board_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'board',
        timestamps: false
    });
    
    return Board;
};