const express = require('express');
const router = express.Router();
const {
  register,
  verifyRegistrationOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');

console.log("Auth routes loaded");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (saves to TempOtp)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to your email for verification
 *       409:
 *         description: Email already registered
 *       400:
 *         description: Missing fields
 */

router.post('/register', register);

/**
 * @swagger
 * /api/auth/verify-registration-otp:
 *   post:
 *     summary: Verify registration OTP and create user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-registration-otp', verifyRegistrationOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: User not verified
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request OTP for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully via email
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset and get reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully, token returned
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-otp', verifyOTP);
/**
 * @swagger
 * /api/auth/set-new-password:
 *   post:
 *     summary: Set a new password using a reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordResetToken
 *               - newPassword
 *             properties:
 *               passwordResetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 *       404:
 *         description: User not found
 */
router.post('/set-new-password', resetPassword);

module.exports = router;
