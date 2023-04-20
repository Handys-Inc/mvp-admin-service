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

    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

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

    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

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

exports.updateAccountStatus = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let user_id = req.params.id;
    let user = new mongoose.Types.ObjectId(user_id);

    let status = req.params.status;
    //if(status !== 'active' || status !== 'suspended') return res.status(400).send('Invalid status');

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

    //check current status
    let currentUser = await User.findById(user, { status: 1}).lean();
    if (currentUser.status === status) return res.status(400).send('Select a different status');


    try {
        let updateStatus = await User.findByIdAndUpdate(user, {
               status: status
            }, { new: true });
            
            if(updateStatus) {
                return res.status(200).send({
                    message: 'User status updated',
                    data: updateStatus
                });
            }
            else return res.status(400).send('User status update failed');

        
    } catch (error) {
        console.log(error)
    }

}

exports.updateKYCStatus = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let user_id = req.params.id;
    let user = new mongoose.Types.ObjectId(user_id);

    let kycStatus = req.params.kyc;

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

    // //check current status
     let currentUser = await ServiceProvider.findOne({user: user}, { kycVerification: 1}).lean();
     if(!currentUser) return res.status(400).send('User not found');

    try {
        let updateKyc;
        if(kycStatus === 'verified') {
            updateKyc = await ServiceProvider.findOneAndUpdate({user: user}, {
                kycVerification: true,
            })
        }
        else if(kycStatus === 'unverified') {
             updateKyc = await ServiceProvider.findOneAndUpdate({user: user}, {
                kycVerification: false,
            }, { new: true });

        }
        else return res.status(400).send('Invalid KYC status');
    
            if(updateKyc) {
                return res.status(200).send({
                    message: 'User status updated',
                    data: updateKyc
                });
            }
            else return res.status(400).send('Provider kyc status update failed');

        
    } catch (error) {
        console.log(error)
    }

}