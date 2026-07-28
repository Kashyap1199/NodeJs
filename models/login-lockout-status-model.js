const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginLockoutStatusSchema = new Schema({
    loginUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // one row per user
    },
    failedAttemptCount: {
        type: Number,
        required: true,
        default: 0
    },
    remainingAttempts: {
        type: Number,
        required: true,
        default: 5 // your configurable max
    },
    isLocked: {
        type: Boolean,
        required: true,
        default: false
    },
    lockoutStartDate: {
        type: Date,
        required: false,
        default: null
    },
    lockoutEndDate: {
        type: Date,
        required: false,
        default: null
    },
    lastFailedLoginDate: {
        type: Date,
        required: false,
        default: null
    },
    lastSuccessfulLoginDate: {
        type: Date,
        required: false,
        default: null
    }
}, {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } // auto-manages both
});

module.exports = mongoose.model('LoginLockoutStatus', loginLockoutStatusSchema);
