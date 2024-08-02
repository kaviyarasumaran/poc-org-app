// models/Organization.js
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    phone_number: { type: String },
    org_id: { type: String, unique: true },
    isConfirmed: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
