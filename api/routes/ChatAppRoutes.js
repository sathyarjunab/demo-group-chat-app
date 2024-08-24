const express = require("express");

const controller = require("../controller/ChatAppController");
const auth = require("../middleware/auth");

const routes = express.Router();

routes.get("/users", controller.getUser);

routes.post("/messages", auth.authorized, controller.postMessage);

routes.get("/messages", auth.authorized, controller.getMessage);

module.exports = routes;
