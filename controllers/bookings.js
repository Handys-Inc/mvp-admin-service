const express = require('express');
const { Booking } = require('../models/booking');
const { ServiceProvider } = require('../models/serviceProvider');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');

const _ = require('lodash');
const mongoose = require('mongoose');


const itemsPerPage = 10;

exports.getJobs = async (req, res) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(user_id);

    if(!loggedIn.adminAccess.includes('super' || 'bookingMgt ')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let jobs = await Booking.find().lean();

        if(!jobs) return res.status(404).send('No jobs found');

        //get client & service provider data

        for(const job of jobs) {
            const client_id = job.client.toString();
            const provider_id = job.serviceProvider.toString();

            //get client data
            const clientData = await User.findOne({ _id: client_id }).select('firstName lastName profilePicture').lean();
            const providerData = await User.findOne({ _id: provider_id }).select('firstName lastName').lean();

            const providerService = await ServiceProvider.findOne({ user: provider_id }).select('serviceType').lean();
            const providerPicture = await ServiceProvider.findOne({ user: provider_id }).select('profilePicture').lean();
            providerData.providerType = providerService;
            providerData.profilePicture = providerPicture;

            job.client = clientData;
            job.provider = providerData;


        }

        const paginateJobs = jobs.slice(startIndex, endIndex);

        if(paginateJobs) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(jobs.length / itemsPerPage),
                message: 'Jobs retrieved',
                data: paginateJobs
            });
        }
        else return res.status(400).send('Jobs retrieval failed');
    } catch (error) {
        console.log(error)
    }
}


exports.getCompleteJobs = async (req, res) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(user_id);

    if(!loggedIn.adminAccess.includes('super' || 'bookingMgt ')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let jobs = await Booking.find({ jobStatus: 'completed' }).lean();

        if(!jobs) return res.status(404).send('No completed jobs found');

        //get client & service provider data

        for(const job of jobs) {
            const client_id = job.client.toString();
            const provider_id = job.serviceProvider.toString();

            //get client data
            const clientData = await User.findOne({ _id: client_id }).select('firstName lastName profilePicture').lean();
            const providerData = await User.findOne({ _id: provider_id }).select('firstName lastName').lean();

            const providerService = await ServiceProvider.findOne({ user: provider_id }).select('serviceType').lean();
            const providerPicture = await ServiceProvider.findOne({ user: provider_id }).select('profilePicture').lean();
            providerData.providerType = providerService;
            providerData.profilePicture = providerPicture;

            job.client = clientData;
            job.provider = providerData;


        }

        const paginateJobs = jobs.slice(startIndex, endIndex);

        if(paginateJobs) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(jobs.length / itemsPerPage),
                message: 'Jobs retrieved',
                data: paginateJobs
            });
        }
        else return res.status(400).send('Jobs retrieval failed');
    } catch (error) {
        console.log(error)
    }
}

exports.getServiceHistory = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let user_id = req.params.id;
    let user = new mongoose.Types.ObjectId(user_id);

    console.log(user)

    const loggedIn = await Admin.findById(admin_id);

    if(!loggedIn.adminAccess.includes('super' || 'userMgt' || 'bookingMgt' )) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let serviceHistory = await Booking.find(
            {
                $or: [
                    { client: user}, 
                    { serviceProvider: user}
                ]
            }
        ).lean();

        if(!serviceHistory) return res.status(404).send('No jobs found for user');

        //get client & service provider data

        for(let service of serviceHistory) {
            const client_id = new mongoose.Types.ObjectId(service.client);
            const provider_id = new mongoose.Types.ObjectId(service.serviceProvider);

            //get client data
            let clientData = await User.findOne({ _id: client_id }).select('firstName lastName').lean();
            let providerData = await User.findOne({ _id: provider_id }).select('firstName lastName').lean();

            let providerService = await ServiceProvider.findOne({ user: provider_id }).select('serviceType').lean();
            providerData.providerType = providerService;

            service.client = clientData;
            service.provider = providerData;
        }

        const paginateJobs = serviceHistory.slice(startIndex, endIndex);

        if(paginateJobs) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(serviceHistory.length / itemsPerPage),
                message: 'Service history retrieved',
                data: paginateJobs
            });
        }
        else return res.status(400).send('Jobs retrieval failed');
    } catch (error) {
        console.log(error)
    }

}