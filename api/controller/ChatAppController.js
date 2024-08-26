const { Op, where, UUID } = require("sequelize");
const { v4: uuid } = require("uuid");
const sequelize = require("../util/DataBase");
const User = require("../model/UserModel");
const Group = require("../model/Groups");

exports.getGroups = async (req, res) => {
  try {
    const groups = await req.user.getMemberGroups({
      include: [
        {
          model: User,
          as: "GroupAdmins",
          attributes: ["id"],
        },
      ],
    });

    const groupsWithAdminStatus = groups.map((group) => {
      const isAdmin = group.GroupAdmins.some(
        (admin) => admin.id === req.user.id
      );

      return {
        ...group.toJSON(),
        isAdmin,
      };
    });
    res.status(200).send(groupsWithAdminStatus);
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

    await group.addMembers(users, { transaction });

    await group.addGroupAdmins([req.user], { transaction });

    await transaction.commit();

    console.log("Group and members created successfully.");

    res.status(200).send(group);
  } catch (error) {
    console.log(error);
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
      include: [
        {
          model: User,
          as: "Members", // Alias for group members
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          model: User,
          as: "GroupAdmins", // Alias for group admins
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
    });

    if (!group) {
      return res.status(404).send("Group not found");
    }

    // Extract users and admins
    const members = group.Members.map((user) => ({
      ...user.toJSON(),
      role: "member",
    }));
    const admins = group.GroupAdmins.map((user) => ({
      ...user.toJSON(),
      role: "admin",
    }));

    // Combine members and admins, ensuring unique entries
    const allUsers = [...members, ...admins];
    const uniqueUsers = Array.from(
      new Map(allUsers.map((user) => [user.id, user])).values()
    );
    res.status(200).send(uniqueUsers);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
exports.makeAdmin = async (req, res) => {
  try {
    const Id = req.params.userid;
    const uuid = req.params.uuid;

    const group = await Group.findOne({
      where: {
        UUID: uuid,
      },
    });
    const user = await User.findOne({
      where: {
        id: Id,
      },
    });
    const groupeadmin = await group.addGroupAdmins([user]);
    res.status(200).send(groupeadmin);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.removeMember = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const userId = req.params.userid;
    const group = await Group.findOne({
      where: { UUID: uuid },
      include: {
        model: User,
        as: "Members",
        through: { attributes: [] },
      },
    });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    const user = group.Members.find((member) => member.id === parseInt(userId));

    if (!user) {
      return res.status(404).send({ message: "User not found in the group." });
    }

    await group.removeMember(user);

    res
      .status(200)
      .send({ message: "User removed from the group successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.searchUsers = async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).send({ message: "Query parameter is required." });
  }

  try {
    // Search users by name or phone number
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { Name: { [Op.like]: `%${query}%` } },
          { PhoneNumber: { [Op.like]: `%${query}%` } },
        ],
      },
    });

    // Send the found users as JSON response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send({ message: "Error searching users." });
  }
};

exports.addUser = async (req, res) => {
  const { uuid } = req.params;
  const userid = Number(req.params.userid);

  try {
    const group = await Group.findOne({
      where: {
        UUID: uuid,
      },
    });

    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }
    console.log(group);
    const user = await User.findByPk(userid);

    console.log(user);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const aaa = await group.addMembers([user]);
    console.log(aaa);
    res.status(200).send({ message: "User added to the group successfully." });
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).send({ message: "Error adding user to group." });
  }
};
