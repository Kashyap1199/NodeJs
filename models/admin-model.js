const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
    },
    mobileNo: {
        type: Number,
    },
    userName: {
        type: String,
    },
    password: {
        type: String,
    },
    image: {
        type: Object
    },
    role: {
        type: String,
    },
    isActive: {
        type: Boolean,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number,
    },
    address: {
        type: String,
    },
});

const AdminModel = mongoose.model('Admin', adminSchema);
module.exports = AdminModel;
