const express = require('express');
require("dotenv").config();

const disputesController = require('../controllers/disputes');
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, disputesController.getDisputes);
router.put("/resolve/:id", auth, disputesController.resolveDispute);

module.exports = router;