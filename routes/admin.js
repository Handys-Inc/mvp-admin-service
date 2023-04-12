const express = require('express');

const adminController = require('../controllers/admin');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", auth, adminController.createAdmin);
router.post("/login", adminController.login);
router.post("/access", auth, adminController.updateAccess);
router.get("/all", auth, adminController.getAllAdmins);
router.post("/edit", auth, adminController.editAdmin);

module.exports = router;