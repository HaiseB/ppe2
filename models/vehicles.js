'use strict';
module.exports = (sequelize, DataTypes) => {
  const vehicles = sequelize.define('vehicles', {
    type: DataTypes.STRING,
    kilometers: DataTypes.INTEGER,
    autonomy: DataTypes.INTEGER,
    fuel: DataTypes.STRING,
    locked: DataTypes.BOOLEAN
  }, {});
  vehicles.associate = function(models) {
    // associations can be defined here
    models.vehicles.hasMany(models.reservations)
  };
  return vehicles;
};