const express = require("express");
const router = express.Router({ mergeParams: true });
const campgrounds = require("../controllers/campgrounds.js");
const catchAsync = require("../utils/catchAsync"); //to catch errors and handle them.
const Campground = require("../models/campground"); //importing the campground model.
const { isLoggedIn } = require("../middleware.js"); //importing middleware for checking logged in.
const { validateCampground } = require("../middleware.js"); //importing middleware for validation.
const { isAuthor } = require("../middleware.js"); //importing middleware for authorization.
const multer = require("multer"); //middleware for storing and taking files in.
const { storage } = require("../cloudinary/index.js"); //importing cloudinary storage.
const upload = multer({ storage });

//to see list of campgrounds.
router.get("/", campgrounds.index);
//to add a new campground
router.get("/new", isLoggedIn, campgrounds.renderNew);
//to save a new campground.
router.post(
  "/",
  isLoggedIn,
  upload.array("image"),
  validateCampground,
  campgrounds.create
);
//form for updating a campground.
router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.renderEdit);
//to update a existing campground.
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("image"),
  validateCampground,
  campgrounds.update
);
//to delete a campground.
router.delete("/:id", isLoggedIn, isAuthor, campgrounds.delete);
//show a campground with all details.
router.get("/:id", campgrounds.show);

module.exports = router;
