'use strict';
module.exports = (sequelize, DataTypes) => {
  const vehicles = sequelize.define('vehicles', {
    type: DataTypes.STRING,
    license_plate: DataTypes.STRING,
    model: DataTypes.STRING,
    brand: DataTypes.STRING,
    places: DataTypes.INTEGER,
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