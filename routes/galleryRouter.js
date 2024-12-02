const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const general = require("../my_modules/generalFnc");
const {
    galleryOpenPage,
    galleryPage
} = require("../controllers/galleryControllers");

//kõikidele marsruutidele vahevara checkLogin
router.use(general.checkLogin);

router.route("/").get(galleryOpenPage);

router.route("/:page").get(galleryPage);

module.exports = router;