// utils/otpUtils.js
const crypto = require("crypto");

exports.generateOtp = () => {
  const otp = crypto.randomBytes(3).toString("hex");
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return { otp, otpExpires };
};

exports.verifyOtp = (inputOtp, storedOtp, otpExpires) => {
  if (Date.now() > otpExpires) return false;
  return inputOtp === storedOtp;
};
