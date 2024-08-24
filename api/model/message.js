const Sequelize = require("sequelize");

const sequelize = require("../util/DataBase");

const Message = sequelize.define("Message", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  Message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Message;
