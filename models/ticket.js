const axios = require('axios');
const mongoose = require("mongoose");
require("dotenv").config();

async function fetchTicketSchema() {
    const url = process.env.TICKET_SCHEMA;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const ticketSchema =  fetchTicketSchema();

const TicketSchema = new mongoose.Schema(ticketSchema);

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports.Ticket = Ticket;