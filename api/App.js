const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/DataBase");
const User = require("./model/UserModel");
const Message = require("./model/message");
const Group = require("./model/Groups");
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

Group.hasMany(Message);
Message.belongsTo(Group, { constraints: true, onDelete: "CASCADE" });

User.belongsToMany(Group, { through: "GroupMember", as: "MemberGroups" });
Group.belongsToMany(User, { through: "GroupMember", as: "Members" });

User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: "GroupAdmin", as: "AdminGroups" });
Group.belongsToMany(User, { through: "GroupAdmin", as: "GroupAdmins" });

// { force: true }
sequelize
  .sync()
  .then((result) => {
    app.listen(3001, () => {
      console.log("connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
