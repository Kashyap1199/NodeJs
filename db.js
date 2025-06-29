require('dotenv').config();
const mongoose = require('mongoose');
const mongoDbUrl = process.env.MONGODBURL;
mongoose.connect(mongoDbUrl);
const db = mongoose.connection;

db.on('connected', () => {
    console.log('Mongodb is connected');
});

db.on('disconnected', () => {
    console.log('Mongodb is dicconnected');
});

db.on('error', (err) => {
    console.log('Mongodb connection error:' + err);
});

module.exports = db;
