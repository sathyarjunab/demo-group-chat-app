const express = require("express");

const controller = require("../controller/ChatAppController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/CheckAdmin");

const routes = express.Router();

routes.get("/groups", auth.authorized, controller.getGroups);

routes.get("/groups/:uuid/messages", auth.authorized, controller.getMessages);

routes.post("/groups/:uuid/messages", auth.authorized, controller.addMessage);

routes.post("/groups", auth.authorized, controller.createGroupWithMembers);

routes.get("/groups/:uuid/users", auth.authorized, controller.getUsers);

routes.post(
  "/groups/:uuid/users/:userid/admin",
  auth.authorized,
  adminAuth.checkIfAdmin,
  controller.makeAdmin
);

routes.delete(
  "/groups/:uuid/users/:userid",
  auth.authorized,
  adminAuth.checkIfAdmin,
  controller.removeMember
);

routes.get("/users/search", auth.authorized, controller.searchUsers);

routes.post(
  "/groups/:uuid/users/:userid",
  auth.authorized,
  adminAuth.checkIfAdmin,
  controller.addUser
);

module.exports = routes;
