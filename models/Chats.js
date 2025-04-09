const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/bd"); // Assuming you have a Sequelize connection setup

const Chat = sequelize.define("Chat", {
  userId: {
    type: DataTypes.INTEGER, // Or DataTypes.UUID if you use UUIDs for users
    allowNull: false,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Chat;
