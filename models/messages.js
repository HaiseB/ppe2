'use strict';
module.exports = (sequelize, DataTypes) => {
  const messages = sequelize.define('messages', {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    attachment: DataTypes.STRING,
    likes: DataTypes.INTEGER,
    users_id: DataTypes.INTEGER
  }, {});
  messages.associate = function(models) {
    // associations can be defined here
    models.messages.belongsTo(models.users, {
      foreignKey:{
        allowNull: false
      }
    })
  };
  return messages;
};