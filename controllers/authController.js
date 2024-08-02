// controllers/authController.js
const Organization = require("../models/Organization");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { generateOtp, verifyOtp } = require("../utils/otpUtils");

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.registerOrganization = async (req, res) => {
    const { name, email, password, address, phone_number } = req.body;

    try {
        let organization = await Organization.findOne({ email });
        if (organization) {
            return res.status(400).json({ msg: "Organization already exists" });
        }

        organization = new Organization({
            name,
            email,
            password: bcrypt.hashSync(password, 10),
            address,
            phone_number,
            org_id: crypto.randomBytes(3).toString("hex"),
        });

        await organization.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Confirm your registration",
            text: `Thank you for registering. Please confirm your email by clicking the following link: http://localhost:${process.env.PORT}/api/org/confirm/${organization.org_id}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: "Error sending email" });
            }
            res.status(200).json({
                msg: "Registration successful, please check your email for confirmation",
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.confirmEmail = async (req, res) => {
    const { org_id } = req.params;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: "Invalid confirmation link" });
        }

        organization.isConfirmed = true;
        await organization.save();

        res.status(200).json({ msg: "Email confirmed, you can now log in" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.loginOrganization = async (req, res) => {
    const { org_id, password } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        if (!organization.isConfirmed) {
            return res
                .status(400)
                .json({ msg: "Please confirm your email first" });
        }

        const isMatch = bcrypt.compareSync(password, organization.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        if (organization.mfaEnabled) {
            const { otp, otpExpires } = generateOtp();
            organization.otp = otp;
            organization.otpExpires = otpExpires;
            await organization.save();

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: organization.email,
                subject: "Your Login OTP",
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res
                        .status(500)
                        .json({ msg: "Error sending OTP email" });
                }
                res.status(200).json({ msg: "OTP sent to your email" });
            });
        } else {
            res.status(200).json({
                msg: "Login successful",
                token: "some-jwt-token",
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.verifyOtp = async (req, res) => {
    const { org_id, otp } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isOtpValid = verifyOtp(
            otp,
            organization.otp,
            organization.otpExpires,
        );
        if (!isOtpValid) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        organization.otp = null;
        organization.otpExpires = null;
        await organization.save();

        res.status(200).json({
            msg: "Login successful",
            token: "some-jwt-token",
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.enableMfa = async (req, res) => {
    const { org_id } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: "Organization not found" });
        }

        organization.mfaEnabled = true;
        await organization.save();

        res.status(200).json({ msg: "MFA enabled" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.disableMfa = async (req, res) => {
    const { org_id } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: "Organization not found" });
        }

        organization.mfaEnabled = false;
        await organization.save();

        res.status(200).json({ msg: "MFA disabled" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};
