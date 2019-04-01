'use strict';
module.exports = (sequelize, DataTypes) => {
  const reservations = sequelize.define('reservations', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    users_id: DataTypes.INTEGER,
    vehicles_id: DataTypes.INTEGER
  }, {});
  reservations.associate = function(models) {
    // associations can be defined here
    models.reservations.belongsToMany(models.users, {
      foreignKey:{
        allowNull: false
      }
    })
    models.reservations.belongsToMany(models.vehicles, {
      foreignKey:{
        allowNull: false
      }
    })
  };
  return reservations;
};