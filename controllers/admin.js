const express = require('express');
const { Admin } = require('../models/admin');

const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createAdmin, generateLoginToken } = require('../utilities/adminAuthentication');


exports.createAdmin = async (req, res) => {
    const admin = req.admin._id;
    const { firstName, lastName, email, password, adminAccess} = req.body;

    const loggedIn = await Admin.findById(admin);

    if(!loggedIn.adminAccess.includes('super')) return res.status(401).send('Unauthorized access');


    const creator = await Admin.findOne({$and: [{_id: admin}]});
    let createdBy = `${creator.firstName} ${creator.lastName}`;


    try {
        let newAdmin = await createAdmin(firstName, lastName, email, password, adminAccess, admin);

        if(newAdmin) {
            newAdmin.creatorName = createdBy;
            return res.status(200).send(newAdmin)
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
    if(!admin) return res.status(404).send('Invalid email or password');

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
              .send({user: lastLogin, token: token.token });
        }
    
        else return res.status(200).send('Login failed');
        
    } catch (error) {
        console.log(error);
    }
}

exports.updateAccess = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid admin id");

    const { adminAccess, adminUser } = req.body;

    const loggedIn = await Admin.findById(admin_id);

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
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

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

exports.editAdmin = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid admin id");
    if (!req.body.email || req.body.email.length < 1 || req.body.firstName || req.body.lastName) return res.status(400).send("Please fill all fields.");

    const { adminUser, firstName, lastName, email } = req.body;

    const loggedIn = await Admin.findById(admin_id);

    if(!loggedIn.adminAccess.includes('super')) return res.status(401).send('Unauthorized access');

    //find admin to be updated
    const admin = await Admin.findById(adminUser);
    if(!admin) return res.status(404).send('Admin user not found');

    const emailCheck = await Admin.findOne({email: email});
        if (emailCheck && emailCheck._id.toString() !== admin._id.toString()) return res.status(400).send("The provided email already belongs to another account.");

    try {

        const updatedAdmin = await Admin.findByIdAndUpdate(adminUser, {
            firstName: firstName,
            lastName: lastName,
            email: email
        }, { new: true });


        if(updatedAdmin) res.status(200).send({
            message: 'Admin user updated',
            data: updatedAdmin
        });
        else res.status(400).send('Admin user update failed');
    } catch (error) {
        console.log(error);
    }
}