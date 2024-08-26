const jwt = require("jsonwebtoken");

const User = require("../model/UserModel");

exports.authorized = (req, res, next) => {
  try {
    const userToken = req.headers["authorization"];
    jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, userId) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      const user = await User.findByPk(userId);
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
