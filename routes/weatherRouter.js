const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const {
	weatherHome,
	locationWeather
} = require("../controllers/weatherControllers");

//marsruudid

router.route("/").get(weatherHome);

router.route("/:id").get(locationWeather);

module.exports = router;