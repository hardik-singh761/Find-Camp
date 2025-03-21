const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync"); //to catch errors and handle them.
const ExpressError = require("../utils/ExpressError"); //error class it handles error and thier types.
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

//to add a new review for a campground.
router.post("/", validateReview, isLoggedIn, catchAsync(reviews.newReview));
//to delete a review.
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
