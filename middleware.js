const { campgroundSchema, reviewSchema } = require("./schemas.js"); //importing schema for our error handler.
const ExpressError = require("./utils/ExpressError.js");
const Campground = require("./models/campground.js");
const Review = require("./models/review.js");

//to check is logged in or not.
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!!");
    return res.redirect("/login");
  }
  next();
};
//to send url you want to go before login in.
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
//for checking if you are author.
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const Camp = await Campground.findById(id);
  if (!Camp.author.equals(req.user._id)) {
    req.flash("error", "You dont have access to this campground.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
//for checking if you are author of that review.
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id,reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You dont have access to this campground.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
//to validate campground enetries.
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); //handling server side errors of campground.
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
//handling server side errors of reviews.
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
