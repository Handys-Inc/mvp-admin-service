const { Admin } = require("../models/admin");
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require("dotenv").config();

async function hash(password) {
    const salt = await bcryptjs.genSalt(10);
    const hashed = await bcryptjs.hash(password, salt);
    return hashed;
};

async function createAdmin(firstName, lastName, email, password, adminAccess, createdBy) {
    try {
        const admin = new Admin({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            email: email.toLowerCase(),
            password: await hash(password),
            profilePicture: "",
            userLevel: "admin", //user or admin
            adminAccess: adminAccess, 
            status: "active",
            createdBy: createdBy
        });

        const newAdmin = await admin.save();
        return newAdmin;
        
    } catch (error) {
        console.error('unable to save admin: ', error);
    }
};


async function generateLoginToken(admin) {
    const payload = {
        _id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // expires in 1 hour
      };
      
      const secret = process.env.JWT_KEY
      const expiresIn = payload.exp;
      
      const token = jwt.sign(payload, secret);

    return {token, expiresIn};
}

async function updateUserPassword (id, newPassword) {
    try {
        const user = await User.updateOne({
            $and: [{_id: id}]
        }, {$set: {password: await hash(newPassword)}});
        return user;
    } catch (error) {
        console.log('unable to create new password ', error );
    }
}




module.exports.createAdmin = createAdmin;
module.exports.generateLoginToken = generateLoginToken;
module.exports.updateUserPassword = updateUserPassword;

