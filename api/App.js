const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/DataBase");
const User = require("./model/UserModel");
const Message = require("./model/message");
const singupRoutes = require("./routes/SignupRoute");
const chatAppRoutes = require("./routes/ChatAppRoutes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://127.0.0.1:5501",
    credentials: true,
  })
);

app.use(singupRoutes);
app.use(chatAppRoutes);

User.hasMany(Message);
Message.belongsTo(User);

// { force: true }
sequelize
  .sync()
  .then((result) => {
    app.listen(3000, () => {
      console.log("connected");
    });
  })
  .catch((err) => {
    console.log(err);
    resizeBy.status(500).send(err);
  });
