const express = require('express');
const { Dispute } = require('../models/dispute');
const { ServiceProvider } = require('../models/serviceProvider');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');
const { Booking } = require('../models/booking');

const _ = require('lodash');
const mongoose = require('mongoose');


const itemsPerPage = 10;

exports.getDisputes = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('support')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let disputes = await Dispute.find().lean();

        if(!disputes.length) return res.status(404).send('No disputes found');

        //get user information

        for(let i = 0; i < disputes.length; i++) {
            let dispute = disputes[i];
            let provider = {};

            let client_id = new mongoose.Types.ObjectId(dispute.client);
            let provider_id = new mongoose.Types.ObjectId(dispute.serviceProvider);

            let providerName = await User.findById(provider_id).select('firstName lastName').lean();
            let providerDetails = await ServiceProvider.findOne({ user: provider_id }).select('profilePicture serviceType').lean();

            provider.name = providerName;
            provider.details = providerDetails;


            //get user data
            let clientData = await User.findById(client_id).select('firstName lastName profilePicture').lean();

            //get job amount
            let jobAmount = await Booking.findById(dispute.booking).select('totalCost').lean();

            let updatedDispute = {
                ...dispute.toObject(),
                provider, 
                clientData,
                jobAmount
            };

            tickets[i] = updatedDispute;

        }

        const paginateTickets = tickets.slice(startIndex, endIndex);

        if(paginateTickets) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(tickets.length / itemsPerPage),
                message: 'Tickets retrieved',
                data: paginateTickets
            });
        }
        else return res.status(400).send('Tickets retrieval failed');
    } catch (error) {
        console.log(error)
    }
}

exports.resolveDispute = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('support')) return res.status(401).send('Unauthorized access');

    const disputeId = req.params.id;
    try {
        let dispute = await Dispute.findOne({ _id: disputeId}).lean();

        if(!dispute) return res.status(404).send('No dispute found');


        //get job amount
        let jobAmount = await Booking.findById(dispute.booking).select('totalCost').lean();

        //resolve dispute
        dispute.disputeStatus = 'resolved';
        dispute.resolvedFor = req.body.resolvedFor;

        await dispute.save();

            let updatedDispute = {
                ...dispute.toObject(),
                jobAmount
            };

            //TO-DO : if dispute is reolved for client, trigger refund

        
        if(updatedDispute) {
            return res.status(200).send({
                message: 'Tickets retrieved',
                data: paginateTickets
            });
        }
        else return res.status(400).send('Tickets retrieval failed');
    } catch (error) {
        console.log(error)
    }
}