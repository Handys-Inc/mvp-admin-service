const express = require('express');
require("dotenv").config();

const refundsController = require('../controllers/refunds');
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, refundsController.getRefunds);
router.put("/update/:status/:id", auth, refundsController.updateRefundRequest);

module.exports = router;