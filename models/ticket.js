const mongoose = require('mongoose');


const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'urgent'],
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
    },
    issue: {
        type: String,
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports.Ticket = Ticket;