const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { generateOTP, validateOTP } = require('../services/otpService');
const { sendEmail } = require('../services/emailService');
const { JWT_SECRET } = require('../config/jwt');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Error logging in' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailHtml = `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: emailHtml,
    });

    if (result.success) {
      res.json({ message: 'OTP sent to email' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP', error: result.error });
    }
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!validateOTP(user, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // OTP verify ke baad temporary token
    const passwordResetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    res.json({ message: 'OTP verified successfully', passwordResetToken });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

const resetPassword = async (req, res) => {
  const { passwordResetToken, newPassword } = req.body;
  try {
    const decoded = jwt.verify(passwordResetToken, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
