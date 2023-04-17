const express = require('express');
require("dotenv").config();

const bookingsController = require('../controllers/bookings');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, bookingsController.getJobs);
router.post("/complete", auth, bookingsController.getCompleteJobs);
router.get("/:id", auth, bookingsController.getServiceHistory);

module.exports = router;