const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const {
    viljaveduHome,
    viljaveduAddTruckIn,
    viljaveduAddingTruckIn,
    viljaveduAddTruckOut,
    viljaveduAddingTruckOut,
    viljaveduChooseSummary,
    viljaveduChoosingSummary
} = require("../controllers/viljaveduController")

router.route("/").get(viljaveduHome);

router.route("/inc_truck").get(viljaveduAddTruckIn);

router.route("/inc_truck").post(viljaveduAddingTruckIn);

router.route("/out_truck").get(viljaveduAddTruckOut);

router.route("/out_truck").post(viljaveduAddingTruckOut);

router.route("/summary").get(viljaveduChooseSummary);

router.route("/summary").post(viljaveduChoosingSummary);

module.exports = router;