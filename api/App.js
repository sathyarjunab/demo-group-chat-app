const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/DataBase");
const singupRoutes = require("./routes/SignupRoute");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(singupRoutes);

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
