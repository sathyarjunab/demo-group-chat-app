const sequelize = require("../util/DataBase");
const User = require("../model/UserModel");
const Group = require("../model/Groups");
const { v4: uuid } = require("uuid");

exports.getGroups = async (req, res) => {
  try {
    const groups = await req.user.getGroups();

    res.status(200).send(groups);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const group = await Group.findOne({
      where: {
        UUID: req.params.uuid,
      },
    });
    const messages = await group.getMessages({
      where: {
        GroupId: group.id,
      },
      include: {
        model: User,
        attributes: ["Name"],
      },
    });
    res.status(200).send(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.addMessage = async (req, res) => {
  try {
    const group = await Group.findOne({
      where: {
        UUID: req.params.uuid,
      },
    });
    const createdMessage = await group.createMessage({
      Message: req.body.text,
      UserId: req.user.id,
    });
    res.status(200).send(createdMessage);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.createGroupWithMembers = async (req, res) => {
  const transaction = await sequelize.transaction();
  req.body.members.push(req.user.Name);
  try {
    const users = await User.findAll({
      where: {
        Name: req.body.members,
      },
    });

    if (users.length !== req.body.members.length) {
      throw new Error("One or more user names are invalid.");
    }

    const group = await Group.create(
      { GroupName: req.body.name, UUID: uuid() },
      { transaction }
    );

    const GroupMembers = await group.addUsers(users, { transaction });

    await transaction.commit();

    console.log("Group and members created successfully.");

    res.status(200).send(group);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send("error");
  }
};

exports.getUsers = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const group = await Group.findOne({
      where: {
        UUID: uuid,
      },
    });
    const users = await group.getUsers();
    console.log("hit");
    res.status(200).send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
