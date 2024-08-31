// controllers/authController.js
const Organization = require('../models/Organization');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

exports.registerOrganization = async (req, res) => {
    const { name, email, password, address, phone_number } = req.body;

    try {
        let organization = await Organization.findOne({ email });
        if (organization) {
            return res.status(400).json({ msg: 'Organization already exists' });
        }

        organization = new Organization({
            name,
            email,
            password: bcrypt.hashSync(password, 10),
            address,
            phone_number,
            org_id: crypto.randomBytes(3).toString('hex'),
        });

        await organization.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirm your registration',
            text: `Thank you for registering. Please confirm your email by clicking the following link: http://localhost:${process.env.PORT}/api/org/confirm/${organization.org_id}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Error sending email' });
            }
            res.status(200).json({ msg: 'Registration successful, please check your email for confirmation' });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.confirmEmail = async (req, res) => {
    const { org_id } = req.params;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: 'Invalid confirmation link' });
        }

        organization.isConfirmed = true;
        await organization.save();

        res.status(200).json({ msg: 'Email confirmed, you can now log in' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginOrganization = async (req, res) => {
    const { org_id, password } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (!organization.isConfirmed) {
            return res.status(400).json({ msg: 'Please confirm your email first' });
        }

        const isMatch = bcrypt.compareSync(password, organization.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (organization.mfaEnabled) {
            const otp = crypto.randomInt(100000, 999999).toString();
            organization.otp = otp;
            await organization.save();
            sendOtpEmail(organization.email, otp);
            return res.status(200).json({ msg: 'OTP sent to your email' });
        } else {
            const token = jwt.sign({ id: organization._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ msg: 'Login successful', token });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyOtp = async (req, res) => {
    const { org_id, otp } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization || organization.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        organization.otp = null;
        await organization.save();

        const token = jwt.sign({ id: organization._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ msg: 'OTP verified, login successful', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.enableTfa = async (req, res) => {
    const { org_id } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: 'Organization not found' });
        }

        const secret = speakeasy.generateSecret({ length: 20 });
        organization.tfaSecret = secret.base32;
        await organization.save();

        res.status(200).json({ msg: 'TFA enabled', secret: secret.otpauth_url });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyTfa = async (req, res) => {
    const { org_id, token } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: 'Organization not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: organization.tfaSecret,
            encoding: 'base32',
            token,
        });

        if (verified) {
            const authToken = jwt.sign({ id: organization._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ msg: 'TFA verified, login successful', token: authToken });
        } else {
            res.status(400).json({ msg: 'Invalid TFA token' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.disableTfa = async (req, res) => {
    const { org_id } = req.body;

    try {
        let organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(400).json({ msg: 'Organization not found' });
        }

        organization.tfaSecret = null;
        await organization.save();

        res.status(200).json({ msg: 'TFA disabled' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
