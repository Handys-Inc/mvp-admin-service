const express = require('express');
require("dotenv").config();

const userController = require('../controllers/users');
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/clients", auth, userController.getClients);
router.get("/providers", auth, userController.getProviders);
router.put("/updateStatus/:status/:id", auth, userController.updateAccountStatus);
router.put("/updateKYC/:kyc/:id", auth, userController.updateKYCStatus);


module.exports = router;