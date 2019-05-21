'use strict';
module.exports = (sequelize, DataTypes) => {
  const reservations = sequelize.define('reservations', {
    status: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    vehicleId: DataTypes.INTEGER
  }, {});
  reservations.associate = function(models) {
    // associations can be defined here
    models.reservations.belongsTo(models.users, {
      foreignKey:{
        allowNull: false
      }
    })
    models.reservations.belongsTo(models.vehicles, {
      foreignKey:{
        allowNull: false
      }
    })
  };
  return reservations;
};