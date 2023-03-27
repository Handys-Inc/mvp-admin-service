const axios = require('axios');
const mongoose = require("mongoose");
require("dotenv").config();

async function fetchDisputeSchema() {
    const url = process.env.DISPUTE_SCHEMA;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const disputeSchema =  fetchDisputeSchema();

const DisputeSchema = new mongoose.Schema(disputeSchema);

const Dispute = mongoose.model("Dispute", DisputeSchema);

module.exports.Dispute = Dispute;