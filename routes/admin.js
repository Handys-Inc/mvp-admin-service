const express = require('express');

const adminController = require('../controllers/admin');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", adminController.createAdmin);
router.post("/login", adminController.login);
router.post("/access", auth, adminController.updateAccess);
router.get("/", adminController.getAllAdmins);

module.exports = router;