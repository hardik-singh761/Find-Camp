const Campground = require("../models/campground"); //importing the campground model.
const catchAsync = require("../utils/catchAsync"); //to catch errors and handle them.
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //mapbox
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //to get the coordinates.
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = catchAsync(async (req, res) => {
  const camps = await Campground.find({});
  res.render("index", { camps });
});

module.exports.renderNew = (req, res) => {
  res.render("new");
};

module.exports.create = catchAsync(async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  const camp = new Campground(req.body.campground);
  camp.geometry = geoData.features[0].geometry;
  camp.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.author = req.user._id;
  await camp.save();
  console.log(camp);
  req.flash("success", "Successfuly made a new Campground.");
  res.redirect(`/campgrounds/${camp._id}`);
});

module.exports.renderEdit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find that Campground.");
    return res.redirect("/campgrounds");
  }
  res.render("edit", { camp });
});

module.exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.image.push(...imgs);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfuly updated a Campground.");
  res.redirect(`/campgrounds/${camp.id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfuly deleted a Campground.");
  res.redirect("/campgrounds");
});

module.exports.show = catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("author");
  if (!camp) {
    req.flash("error", "Cannot find that Campground.");
    return res.redirect("/campgrounds");
  }
  res.render("show", { camp });
});
