const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
    },
});

const RoleModel = mongoose.model('Role', roleSchema);
module.exports = RoleModel;
