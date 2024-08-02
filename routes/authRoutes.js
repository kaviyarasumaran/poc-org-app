// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerOrganization,
  confirmEmail,
  loginOrganization,
  verifyOtp,
  enableMfa,
  disableMfa,
} = require("../controllers/authController");

router.post("/register", registerOrganization);
router.get("/confirm/:org_id", confirmEmail);
router.post("/login", loginOrganization);
router.post("/verify-otp", verifyOtp);
router.post("/enable-mfa", enableMfa);
router.post("/disable-mfa", disableMfa);

module.exports = router;
