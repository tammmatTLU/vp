const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const general = require("../my_modules/generalFnc");
const {
    estFilmHome,
    estFilmPeople,
    estFilmRelations,
    estFilmAddData,
    estFilmAddingData,
    estFilmAddRelations,
    estFilmAddingRelations
} = require("../controllers/estFilmController")
//kõikidele marsruutidele vahevara checkLogin
router.use(general.checkLogin);

//marsruudid
router.route("/").get(estFilmHome);

router.route("/tegelased").get(estFilmPeople);

router.route("/personrelations/:id").get(estFilmRelations);

router.route("/lisa").get(estFilmAddData);

router.route("/lisa").post(estFilmAddingData);

router.route("/lisaseos").get(estFilmAddRelations);

router.route("/lisaseos").post(estFilmAddingRelations);

module.exports = router;