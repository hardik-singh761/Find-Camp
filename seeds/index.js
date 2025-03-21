const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities"); //importing cities array.
const { firstword, secondword } = require("./namehelper"); //importing firstword and secondword arrays from names.

mongoose.connect("mongodb://127.0.0.1:27017/findcamp"); //connecting mongooose.

const db = mongoose.connection; //error handling.
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]; //a random name from an array.

const seedDB = async () => {
  await Campground.deleteMany({}); //deleting whole collection before adding 50 random camps.
  for (let i = 0; i < 150; i++) {
    const random200 = Math.floor(Math.random() * 200); //making a random no. from 1-200 so we can add cities.
    const price = Math.floor(Math.random() * 5000) + 1000;
    const camp = new Campground({
      author: "6697aaf6694bb16bfefe2e18", //setting myself as yhe author of existing camps.
      location: `${cities[random200].name}, ${cities[random200].state}`, //taking random locations from cities.
      title: `${sample(firstword)} ${sample(secondword)}`, //passing arrays to sample function so it can return random names.
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. A ex explicabo tempora numquam expedita animi, nostrum sedipsum.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random200].lon, cities[random200].lat],
      },
      image: [
        {
          url: "https://res.cloudinary.com/djarnglju/image/upload/v1721317043/FindCamp/oka5pjhilvwtzheqbz17.jpg",
          filename: "FindCamp/oka5pjhilvwtzheqbz17",
        },
        {
          url: "https://res.cloudinary.com/djarnglju/image/upload/v1721317074/FindCamp/sh3wv1vmfaysetcaoosu.jpg",
          filename: "FindCamp/sh3wv1vmfaysetcaoosu",
        },
      ],
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close(); //closing db after saving.
});
