const mongoose = require("mongoose");
const { Schema } = mongoose;

const emailVerificationSchema = new mongoose.Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      require: true
    },
    isEmailVerified:{
      type: Boolean,
      default: false
    },
    isEmailVerificationInviteExpired: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      require: true
    },
    expireAt: {
      type: Date,
    }
},
    { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema)

module.exports = EmailVerification;
