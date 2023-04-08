const express = require('express');
const { Admin } = require('../models/admin');

const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateLoginToken } = require('../utilities/adminAuthentication');


exports.createAdmin = async (req, res) => {
    console.log("here");
    //const admin = req.user._id;
    const { firstName, lastName, email, password, adminAccess, createdBy} = req.body;

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

        await admin.save();

        if(admin) {
            return res.status(200).send(admin)
        }
        else{
            return res.status(400).send('Admin creation failed');
        }

    } catch (error) {
        console.error('unable to save admin: ', error);
    }
};

exports.login = async (req, res) => {

    let admin = null;
    if(req.body.email) admin = await Admin.findOne({$and: [{email: req.body.email.toLowerCase()}]});
    if(!user) return res.status(404).send('Invalid email or password');

    const validPassowrd = await bcrypt.compare(
        req.body.password, 
        admin.password
        );
    if(!validPassowrd) return res.status(404).send('Invalid email or password');

    try {
        let token = await generateLoginToken(admin);

        let timestamp = token.expiresIn;
        let dateObj = new Date(timestamp * 1000);

        //last login
        let lastLogin = await Admin.findByIdAndUpdate(admin._id, {
            $set: {
                'lastLogin': new Date()
            },
        }, { new: true });

        lastLogin.token = token.token;

        if(lastLogin) {
            return res.header("x-auth-token", token.token)
              .status(200)
              .send(lastLogin);
        }
    
        else return res.status(200).send('Login failed');
        
    } catch (error) {
        console.log(error);
    }
}

exports.updateAccess = async (req, res) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const { adminAccess, adminUser } = req.body;

    const loggedIn = await Admin.findById(user_id);

    if(!loggedIn.adminAccess.includes('super')) return res.status(401).send('Unauthorized access');

    //find user to be updated
    const admin = await Admin.findById(adminUser);
    if(!admin) return res.status(404).send('Admin user not found');

    try {
        admin.adminAccess.push(...adminAccess)
        await admin.save();

        if(admin) res.status(200).send({
            message: 'Admin access updated',
            data: admin
        });
        else res.status(400).send('Admin access update failed');
    } catch (error) {
        console.log(error);
    }
}

const itemsPerPage = 10;

exports.getAllAdmins = async (req, res) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let admins = await Admin.find().lean();

        if(!admins) return res.status(404).send('No admin users found');

        const paginateAdmins = admins.slice(startIndex, endIndex);

        if(paginateAdmins) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(admins.length / itemsPerPage),
                message: 'Admin users retrieved',
                data: paginateAdmins
            });
        }
        else return res.status(400).send('Admin users retrieval failed');
    } catch (error) {
        console.log(error)
    }
}