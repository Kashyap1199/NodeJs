require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/employee-model');
const AdminModel = require('./models/admin-model');
const DesignationModel = require('./models/designation-model');
const RoleModel = require('./models/role-model');
const EmailVerification =  require('./models/email-verification-model');
const LoginAttemptLogModel = require('./models/login-attempt-log-model');
const LoginLockoutStatusModel = require('./models/login-lockout-status-model');
const mongoDbUrl = process.env.MONGODBURL;
mongoose.connect(mongoDbUrl);
const db = mongoose.connection;
const designationSeeds = require('./dataConfiguration/designation-data-configuratoin');
const roleSeeds = require('./dataConfiguration/role-data-configuration');

const seedInitialData = async () => {
  try {
        // Optional: clear existing data first
        await DesignationModel.deleteMany({});
        await RoleModel.deleteMany({});

        await DesignationModel.insertMany(designationSeeds);
        await RoleModel.insertMany(roleSeeds);
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        // await mongoose.disconnect();
    }
}

db.on('connected', async () => {
    console.log('Mongodb is connected');

    try {
        await Employee.createCollection();
        await AdminModel.createCollection();
        await DesignationModel.createCollection();
        await RoleModel.createCollection();
        await LoginAttemptLogModel.createCollection();
        await LoginLockoutStatusModel.createCollection();
        await EmailVerification.createCollection();
        await seedInitialData();
    } catch (err) {
        console.log('Collection initialization error: ' + err.message);
    }
});

db.on('disconnected', () => {
    console.log('Mongodb is disconnected');
});

db.on('error', (err) => {
    console.log('Mongodb connection error:' + err);
});

module.exports = db;
