const express = require('express');
const { Ticket } = require('../models/ticket');
const { ServiceProvider } = require('../models/serviceProvider');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');

const _ = require('lodash');
const mongoose = require('mongoose');


const itemsPerPage = 10;

exports.getTickets = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('support')) return res.status(401).send('Unauthorized access');

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    try {
        let tickets = await Ticket.find().lean();

        if(!tickets.length) return res.status(404).send('No tickets found');

        //get user information

        for(const ticket of tickets) {
            const user_id = ticket.user.toString();

            //get user data
            const userData = await User.findOne({ user: user_id }).select('firstName lastName profilePicture').lean();

            ticket.user = userData;

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

exports.updateTicketStatus = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let ticket_id = req.params.id;
    let ticket = new mongoose.Types.ObjectId(ticket_id);
    let status = req.params.status;
    //if(status !== 'open' || status !== 'close') return res.status(400).send('Invalid status');

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

    //check current status
    let currentTicket = await Ticket.findById(ticket, { status: 1}).lean();
    if (currentTicket.status === status) return res.status(400).send('Select a different status');

    try {
        let updateStatus = await Ticket.findByIdAndUpdate(ticket, {
               status: status
            }, { new: true });
            
            if(updateStatus) {
                return res.status(200).send({
                    message: 'Ticket status updated',
                    data: updateStatus
                });
            }
            else return res.status(400).send('Ticket status update failed');

    } catch (error) {
        console.log(error)
    }

}

exports.updateTicketPriority = async (req, res) => {
    const admin_id = req.admin._id;
    let isValid = mongoose.Types.ObjectId.isValid(admin_id);

    if (!isValid) return res.status(400).send("Invalid user id");

    let ticket_id = req.params.id;
    let ticket = new mongoose.Types.ObjectId(ticket_id);
    let priority = req.params.priority;
    //if(status !== 'low' || status !== 'medium' || status !== 'urgent') return res.status(400).send('Invalid status');

    const loggedIn = await Admin.findById(admin_id);
    if(!loggedIn.adminAccess.includes('super') && !loggedIn.adminAccess.includes('userMgt')) return res.status(401).send('Unauthorized access');

    //check current status
    let currentTicket = await Ticket.findById(ticket, { priority: 1}).lean();
    if (currentTicket.priority === priority) return res.status(400).send('Select a different priority status');

    try {
        let updatePriority = await Ticket.findByIdAndUpdate(ticket, {
               priority: priority
            }, { new: true });
            
            if(updatePriority) {
                return res.status(200).send({
                    message: 'Ticket priority updated',
                    data: updatePriority
                });
            }
            else return res.status(400).send('Ticket priority update failed');

        
    } catch (error) {
        console.log(error)
    }

}