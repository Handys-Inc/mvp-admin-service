const express = require('express');
require("dotenv").config();

const bookingsController = require('../controllers/bookings');
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, bookingsController.getJobs);
router.get("/completed", auth, bookingsController.getCompletedJobs);
router.get("/:id", auth, bookingsController.getServiceHistory);

module.exports = router;