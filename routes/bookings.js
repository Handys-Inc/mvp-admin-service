const express = require('express');
require("dotenv").config();

const bookingsController = require('../controllers/bookings');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, bookingsController.getJobs);
router.post("/complete", auth, bookingsController.getCompleteJobs);
router.get("/:client_id", auth, bookingsController.getClientServiceHistory);
router.get("/:provider_id", auth, bookingsController.getProviderServiceHistory);

module.exports = router;