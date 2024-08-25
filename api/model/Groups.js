const Sequelize = require("sequelize");

const sequelize = require("../util/DataBase");

const Group = sequelize.define("Group", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  GroupName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  UUID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Group;
