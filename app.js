if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose"); //database
const ejsMate = require("ejs-mate"); //a engine package to style or layout ejs.
const session = require("express-session"); //session package.
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError"); //error class it handles error and thier types.
const methodOverride = require("method-override"); //for using put,delete.
const { title } = require("process");
const passport = require("passport");
const LocalStrategy = require("passport-local"); //it hashesh on its own for us.
const User = require("./models/user"); //models for users.
const helmet = require("helmet"); //setting http headers.
const MongoStore = require("connect-mongo");

const mongoSanitize = require("express-mongo-sanitize"); //security.

const campgroundRoutes = require("./routes/campgrounds.js"); //importing routes of campgrounds.
const reviewRoutes = require("./routes/reviews.js"); //importing routes of reviews.
const userRoutes = require("./routes/users.js"); //importing routes of users.
const exp = require("constants");
const { name } = require("ejs");
const dbUrl =  "mongodb://127.0.0.1:27017/findcamp";

mongoose.connect(dbUrl); //connecting mongoose.

const db = mongoose.connection; //handling the error.
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //required for a post request.
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //to use external css and js from public folder.
app.use(mongoSanitize()); //security.
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const secret = process.env.SECRET || "thisissecret";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, //security.
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //cookie expires after 1 week means logout after 1 week.
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig)); //sessions
app.use(flash());

app.use(passport.initialize()); //authorization
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //authenticate fn made by tool
passport.serializeUser(User.serializeUser()); //something it is
passport.deserializeUser(User.deserializeUser()); //again something it is.

app.use((req, res, next) => {
  //middleware to send flash messages.
  res.locals.currentUser = req.user; //to store data of current logged in user.
  res.locals.success = req.flash("success"); //to use success flash messages.
  res.locals.error = req.flash("error"); //to use error flash messages.
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

//home page
app.get("/", (req, res) => {
  //setting home page.
  res.render("home");
});

//if any above is not then this runs.
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not Found", 404));
});
//give us error.
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "A Error has been Found!!";
  res.status(status).render("error", { err });
});

app.listen("8080", () => {
  //listening on port 8080.
  console.log("Serving on local port 8080.");
});
