const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync"); //to catch errors and handle them.
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

//to register form.
router.get("/register", users.renderRegisterForm);
//register route.
router.post("/register", catchAsync(users.register));
//to login form.
router.get("/login", users.renderLoginForm);
//login route
router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);
//logout route
router.get("/logout", users.logout);

module.exports = router;
