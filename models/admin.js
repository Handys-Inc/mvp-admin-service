const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        maxlength: 150
    },
    password: {
        type: String
    },
    profilePicture: {
        type: String
    },
    userLevel: {
        type: String
        //'user','admin'
    },
    adminAccess: {
        type: [String],
        enum: ['userMgt', 'reporting', 'bookingMgt', 'support', 'payouts', 'super' ],
    },
    lastLogin: {
        type: Date
    },
    status: {
        type: String
    },
    lastUpdatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports.Admin = Admin;