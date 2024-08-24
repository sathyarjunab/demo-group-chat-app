const User = require("../model/UserModel");
const Message = require("../model/message");

exports.getUser = async (req, res) => {
  try {
    const allUser = await User.findAll();
    res.status(201).send(allUser);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.postMessage = async (req, res) => {
  try {
    const message = await req.user.createMessage({
      Message: req.body.text,
    });
    res.status(201).send(message);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.getMessage = async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      attributes: ["Message"],
    });
    const adss = await JSON.stringify(messages);
    res.status(200).send(adss);
  } catch (err) {
    console.log(err);
  }
};
