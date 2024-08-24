const express = require("express");

const controller = require("../controller/SignupController");

const routes = express.Router();

routes.post("/signup", controller.signupPost);

routes.post("/login", controller.loginPost);

module.exports = routes;
