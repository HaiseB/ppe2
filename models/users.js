'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    bio: DataTypes.STRING,
    locked: DataTypes.BOOLEAN,
    role: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
    models.users.hasMany(models.reservations),
    models.users.hasMany(models.messages)
  };
  return users;
};