'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    bio: DataTypes.STRING,
    locked: DataTypes.BOOLEAN,
    roles_id: DataTypes.INTEGER
  }, {});
  users.associate = function(models) {
    // associations can be defined here
    models.users.HasMany(models.reservations)
    models.users.HasMany(models.messages)
  };
  return users;
};