const express = require('express');
require("dotenv").config();

const ticketsController = require('../controllers/tickets');
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, ticketsController.getTickets);
router.put("/updateStatus/:status/:id", auth, ticketsController.updateTicketStatus);
router.put("/updatePriority/:priority/:id", auth, ticketsController.updateTicketPriority);

module.exports = router;