// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerOrganization,
  confirmEmail,
  loginOrganization,
  verifyOtp,
  enableTfa,
  verifyTfa,
  disableTfa
} = require('../controllers/authController');

router.post('/register', registerOrganization);
router.get('/confirm/:org_id', confirmEmail);
router.post('/login', loginOrganization);
router.post('/verify-otp', verifyOtp);
router.post('/enable-tfa', enableTfa);
router.post('/verify-tfa', verifyTfa);
router.post('/disable-tfa', disableTfa);

module.exports = router;
