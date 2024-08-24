const { where } = require("sequelize");
const User = require("../model/UserModel");
const bcrypt = require("bcrypt");

exports.signupPost = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      where: { Email: req.body.email },
    });
    console.log(existingUser);
    if (!existingUser) {
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          console.log(err);
          throw new Error(err);
        }
        const user = await User.create({
          Name: req.body.name,
          Email: req.body.email,
          PhoneNumber: req.body.phone,
          Password: hash,
        });
        res.status(201).json({
          message: "user as been created successfully",
          result: user,
        });
      });
    } else {
      res.status(404).send({ message: "user already exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
