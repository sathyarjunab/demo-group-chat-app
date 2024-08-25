const express = require("express");

const controller = require("../controller/ChatAppController");
const auth = require("../middleware/auth");

const routes = express.Router();

routes.get("/groups", auth.authorized, controller.getGroups);

routes.get("/groups/:uuid/messages", auth.authorized, controller.getMessages);

routes.post("/groups/:uuid/messages", auth.authorized, controller.addMessage);

routes.post("/groups", auth.authorized, controller.createGroupWithMembers);

routes.get("/groups/:uuid/users", auth.authorized, controller.getUsers);

module.exports = routes;
