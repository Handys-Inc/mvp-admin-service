const express = require('express');
const { Admin } = require('../models/admin');
const { User } = require('../models/user');
const { ServiceProvider } = require('../models/serviceProvider');

const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateLoginToken } = require('../utilities/adminAuthentication');


const itemsPerPage = 10;

exports.getClients = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);

    if(!loggedIn.adminAccess.includes('super' || 'usermgt ')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let clients = await User.find({ userAccess: {$in: ['customer']}}).lean();

        if(!clients) return res.status(404).send('No clients found');

        const paginateClients = clients.slice(startIndex, endIndex);

        if(paginateClients) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(clients.length / itemsPerPage),
                message: 'Clients retrieved',
                data: paginateClients
            });
        }
        else return res.status(400).send('Clients retrieval failed');
    } catch (error) {
        console.log(error)
    }
}

exports.getProviders = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);

    if(!loggedIn.adminAccess.includes('super' || 'usermgt ')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let providers = await User.find( { userAccess: { $in: ['service']}}).lean();


        if(!providers) return res.status(404).send('No admin users found');

        for(const provider of providers) {
            const provderData = await ServiceProvider.findOne({ user: provider._id }, { profilePicture: 1, kycVerification: 1}).lean();
            
            provider.provderData = provderData;
        }
        const paginateProviders = providers.slice(startIndex, endIndex);

        if(paginateProviders) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(providers.length / itemsPerPage),
                message: 'Providers retrieved',
                data: paginateProviders
            });
        }
        else return res.status(400).send('Providers retrieval failed');
    } catch (error) {
        console.log(error)
    }
}