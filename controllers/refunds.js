const express = require('express');
const { Refund } = require('../models/refund');
const { ServiceProvider } = require('../models/serviceProvider');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');

const _ = require('lodash');
const mongoose = require('mongoose');


const itemsPerPage = 10;

exports.getRefunds = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('support')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let refunds = await Refund.find().lean();

        if(!refunds.length) return res.status(404).send('No refunds found');

        //get user information

        for(const refund of refunds) {
            const user_id = refund.client.toString();

            //get user data
            const userData = await User.findOne({ user: user_id }).select('firstName lastName profilePicture').lean();

            refund.user = userData;

        }

        const paginateRefunds = refunds.slice(startIndex, endIndex);

        if(paginateRefunds) {
            return res.status(200).send({
                page: page,
                totalPages: Math.ceil(refunds.length / itemsPerPage),
                message: 'Refunds retrieved',
                data: paginateRefunds
            });
        }
        else return res.status(400).send('Tickets retrieval failed');
    } catch (error) {
        console.log(error)
    }
}

exports.updateRefundRequest = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let refund_id = req.params.id;
    let refund = new mongoose.Types.ObjectId(refund_id);
    let status = req.params.status;
    //if(status !== 'open' || status !== 'close') return res.status(400).send('Invalid status');

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

    //check current status
    let currentRequest = await Refund.findById(refund, { refundStatus : 1}).lean();
    if (currentRequest.refundStatus === 'approved') return res.status(400).send('Request already approved');

    try {
        let updateRefundRequest = await Refund.findByIdAndUpdate(refund, {
            refundStatus: status
            }, { new: true });
            
            if(updateRefundRequest.refundStatus === 'approved') {
                return res.status(200).send({
                    message: 'Refund request approved',
                    data: updateRefundRequest
                });
            }
            else if(updateRefundRequest.refundStatus === 'denied') {
                return res.status(200).send({
                    message: 'Refund request updated : denied',
                    data: updateRefundRequest
                });
            }
            else return res.status(400).send('Refund request status update failed');

    } catch (error) {
        console.log(error)
    }

}