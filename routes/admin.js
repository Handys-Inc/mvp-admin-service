const express = require('express');
require("dotenv").config();

const adminController = require('../controllers/admin');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", adminController.createAdmin);
router.post("/login", adminController.login);
router.post("/access", auth, adminController.updateAccess);
router.get("/", auth, adminController.getAllAdmins);

module.exports = router;