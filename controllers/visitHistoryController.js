import visitHistory from '../models/visitHistory.js';
import queue from '../models/queue.js';
import { Aes256 } from '../security/aes256.js';
import dotenv from 'dotenv'

dotenv.config();

export const saveVisitHistory = (req , res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        const data = new visitHistory(request);
        visitHistory.find({$or: [{doctorName : request.doctorName}]}).sort({ createdAt: -1 })
            .then(response => {
                var ticketNo = '';
                var sequence = 1;
                var prefix = '';
                if (request.specialization == 'UMUM') {
                    prefix = 'U'
                } else if (request.specialization == 'GIGI'){
                    prefix = 'G'
                } else if (request.specialization == 'IBU_ANAK'){
                    prefix = 'A'
                }
                if ( response.length == 0 ) {
                    ticketNo = prefix + '001';
                }  else {
                    sequence = response[0].sequence + 1;
                    if (sequence.toString().length == 1) {
                        ticketNo = prefix + '00' + sequence;
                    } else if (sequence.toString().length == 2){
                        ticketNo = prefix + '0' + sequence;
                    } else if (sequence.toString().length == 3){
                        ticketNo = prefix + sequence;
                    }
                }
                data.status = 'IDLE';
                data.ticketNo = ticketNo;
                data.sequence = sequence;
                data.save().then(response => {
                    res.status(200).json({
                        message : "Success",
                        object : response
                    });
                });
        });
    } catch ( error ) {
        res.status(500).json({
            message : 'Err : ' + error.message
        });
    }   
}

export const getListHistory = async(req, res) => {
    try {
        visitHistory.find().then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : error.message
        });
    }
}

export const getHistory = async(req, res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        const parameter = [];
        if ( request.param == 'fullname' ) {
            parameter.push({patientName : request.value});
        } else if ( request.param == 'bpjsNo' ) {
            parameter.push({bpjsNo : request.value});
        } else  if ( request.param == 'date' ) {
            parameter.push({ createdAt: { $gte: request.startDate, $lte:  request.endDate }});
        }
        visitHistory.find({$or: parameter})
        .then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : error.message
        });
    }
}

export const getTodayVisit = async(req, res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const parameter = [];
        parameter.push({doctorName : request.doctorName, status : 'IDLE'});
        visitHistory.findOne({$or: parameter})
        .sort({ date: 1 })
        .then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : error.message
        });
    }
}

export const getListTodayVisit = async(req, res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const parameter = [];
        parameter.push({doctorName : request.doctorName});
        visitHistory.find({$or: parameter})
        .sort({ date: 1 })
        .then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : error.message
        });
    }
}

export const updateVisitHistory = (req , res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        visitHistory.updateOne(
            { _id: request.id },
            { $set: { complaint: request.complaint,
                status: request.status
            } },
        ).then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : 'Err : ' + error.message
        });
    }   
}

export const getHistoryByDoctor = async(req, res) => {
    try {
        const request = JSON.parse(Aes256.decryptUsingAES256(req.body));
        const parameter = [];
        parameter.push({doctorName : request.doctorName});
        if ( request.param == 'patientName' ) {
            parameter.push({patientName : request.value});
        } else  if ( request.param == 'date' ) {
            parameter.push({ createdAt: { $gte: request.startDate, $lte:  request.endDate }});
        }
        visitHistory.find({$or: parameter})
        .then(response => {
            res.status(200).json({
                message : "Success",
                object : response
            });
        });
    } catch ( error ) {
        res.status(500).json({
            message : error.message
        });
    }
}