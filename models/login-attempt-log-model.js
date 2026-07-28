const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginAttemptLogSchema = new Schema({
    loginUserId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: false,
        default: null
    },
    attemptedUsername: {
        type: String,
        required: false,
        maxlength: 256,
        default: null
    },
    attemptDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    isSuccess: {
        type: Boolean,
        required: true,
        default: false
    },
    failedReason: {
        type: String,
        required: false,
        default: null
    },
    ipAddress: {
        type: String,
        required: false,
        maxlength: 45,
        default: null
    },
    userAgent: {
        type: String,
        required: false,
        maxlength: 500,
        default: null
    }
},{
    timestamps: { createdAt: 'createdDate', updatedAt: false } // no update needed, log is insert-only
});

// Indexes for fast lookups
loginAttemptLogSchema.index({ loginUserId: 1 });
loginAttemptLogSchema.index({ attemptDate: -1 });

module.exports = mongoose.model('LoginAttemptLog', loginAttemptLogSchema);
