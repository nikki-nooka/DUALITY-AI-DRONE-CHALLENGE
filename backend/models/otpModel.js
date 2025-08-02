const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
        ref: 'User'
    },
    otp: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // TTL: Document will be automatically deleted after 5 minutes (300 seconds)
    },
    isUsed: {
        type: Boolean,
        default: false
    }
});

// Create a TTL index on createdAt field
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP; 