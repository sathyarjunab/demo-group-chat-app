const User = require("../model/UserModel");
const Group = require("../model/Groups");

exports.checkIfAdmin = async (req, res, next) => {
  try {
    const userId = req.params.userid;
    const uuid = req.params.uuid;
    const group = await Group.findOne({
      where: { UUID: uuid },
      include: [
        {
          model: User,
          as: "GroupAdmins",
          attributes: ["id"],
        },
      ],
    });
    const { GroupAdmins } = group;
    let flag = false;
    for (let i = 0; i < GroupAdmins.length; i++) {
      if (
        GroupAdmins[i].GroupAdmin.UserId === req.user.id ||
        GroupAdmins[i].GroupAdmin.UserId === userId
      ) {
        flag = true;
        break;
      }
    }
    if (flag) {
      next();
    } else {
      res.status(500).send({ message: "user not autharized" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
