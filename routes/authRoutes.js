// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerOrganization, confirmEmail, loginOrganization } = require('../controllers/authController');

router.post('/register', registerOrganization);
router.get('/confirm/:org_id', confirmEmail);
router.post('/login', loginOrganization);

module.exports = router;
