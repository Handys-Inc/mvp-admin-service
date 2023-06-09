const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String
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
    userAccess: {
        type: [String],
        enum: ['service','customer'],
    },
    lastLogin: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        //default: 'active'
    },
    lastUpdatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verificationToken: {
        type: String
    },
    passwordChangeToken: {
        type: String
    },
    accessToken: {
        type: String
    },
    authType: {
        type: String,
        enum: ['google','email','facebook'],
        default: 'email'
    },
    verified: {
        email: {
            type: Boolean
        },
        number: {
            type: Boolean
        }
    }
});

userSchema.methods.generateAuthToken = async function () {
    const key = process.env.JWT_KEY
    return jwt.sign({_id: this._id, firstName: this.firstName, lastName: this.lastName}, key);
};

const User = mongoose.model('User', userSchema);

module.exports.User = User;