const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { generateOTP, validateOTP } = require('../services/otpService');
const sendEmail = require('../services/emailService');
const { JWT_SECRET } = require('../config/jwt');
const { sendSms } = require('../services/smsService');

// ✅ REGISTER
const register = async (req, res) => {
  const { username, email, password, firstname, lastname, phone } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      let conflictField = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({ message: `User already exists with this ${conflictField}` });
    }

    const otp = generateOTP();
    const user = new User({
      username,
      email,
      password,
      firstname,
      lastname,
      phone,
      isVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      otpPurpose: 'registration' // ✅ Set OTP purpose
    });

    await user.save();

    const emailHtml = `
      <h2>Email Verification OTP</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: emailHtml,
    });

    if (phone) {
      const smsText = `Your verification OTP is ${otp}. Valid for 10 minutes.`;
      await sendSms({ to: phone, text: smsText });
    }

    res.status(201).json({
      message: 'Registration successful. OTP sent via Email' + (phone ? ' and SMS.' : '.'),
      userId: user._id
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// ✅ VERIFY REGISTRATION OTP
const verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (
      user.otpPurpose !== 'registration' ||
      !user.otp ||
      user.otp !== otp ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;

    await user.save();

    res.json({ message: 'User verified successfully. You can now login.' });
  } catch (err) {
    console.error('OTP Verification Error:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email/phone before logging in.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// ✅ FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'reset'; // ✅ Set purpose
    await user.save();

    const emailHtml = `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: emailHtml,
    });

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP via email', error: emailResult.error });
    }

    const phoneToUse = phone || user.phone;
    if (phoneToUse) {
      const smsText = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      const smsResult = await sendSms({ to: phoneToUse, text: smsText });

      if (!smsResult.success) {
        return res.status(500).json({ message: 'Failed to send OTP via SMS', error: smsResult.error });
      }
    }

    res.json({ message: 'OTP sent successfully' + (phoneToUse ? ' via SMS and Email' : ' via Email') });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// ✅ VERIFY PASSWORD RESET OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (
      user.otpPurpose !== 'reset' ||
      !user.otp ||
      user.otp !== otp ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;

    await user.save();

    const passwordResetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    res.json({ message: 'OTP verified successfully', passwordResetToken });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// ✅ RESET PASSWORD
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
  verifyRegistrationOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
