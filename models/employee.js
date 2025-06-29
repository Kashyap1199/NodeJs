const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: Number,
        required: true,
        unique: true
    },
    designation: {
        type: String,
        enum: ['Developer', 'Tester', 'Designer', 'Team leader'],
        required: true
    },
    userName: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: Object
    }
});

employeeSchema.index({ userName: 1}, { unique: true});

employeeSchema.pre('save', async function (next) {
    const employee = this;

    if (!employee.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(employee.password, salt);
        employee.password = hashPassword;
        next();
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

employeeSchema.methods.comparedPassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        console.log(err);
        throw err;
        // return { errorName: err.name, errorMessage: err.message };
    }
}

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;