const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
    designationName: {
        type: String,
    },
});

const DesignationModel = mongoose.model('Designation', designationSchema);
module.exports = DesignationModel;
