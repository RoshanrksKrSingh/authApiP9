const User = require('../models/userModel');
const TempOtp = require('../models/TempOtp');   // <-- Add this model
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { generateOTP } = require('../services/otpService');
const sendEmail = require('../services/emailService');
const { JWT_SECRET } = require('../config/jwt');


// REGISTER: Save OTP + data in TempOtp collection instead of session
const register = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();

    // Remove any old OTP for same email
    await TempOtp.deleteOne({ email });

    // Save OTP + user data temporarily
    const tempOtp = new TempOtp({
      email,
      firstName,
      lastName,
      phone,
      password, // ideally hash before saving here
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });
    await tempOtp.save();

    await sendEmail({
      to: email,
      subject: 'Your Registration OTP',
      html: `<p>Your OTP is <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p>`,
    });
    return res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });

  } catch (err) {
    console.error('Registration Error:', err.message);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// VERIFY OTP: Read from TempOtp collection instead of session
const verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempOtpRecord = await TempOtp.findOne({ email });
    if (
      !tempOtpRecord ||
      tempOtpRecord.otp !== otp ||
      tempOtpRecord.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate username
    const generatedUsername =
      tempOtpRecord.firstName.toLowerCase() + Date.now().toString().slice(-6);

    // Create user after OTP verification
    const user = new User({
      username: generatedUsername,
      firstName: tempOtpRecord.firstName,
      lastName: tempOtpRecord.lastName,
      email: tempOtpRecord.email,
      phone: tempOtpRecord.phone,
      password: tempOtpRecord.password,
      isVerified: true,
    });

    await user.save();

    // Delete temp OTP record after success
    await TempOtp.deleteOne({ email });

    res.status(201).json({ message: 'Registration successful. You can now login.' });
  } catch (err) {
    console.error('OTP Verification Error:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

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
        firstname: user.firstName,
        lastname: user.lastName,
        phone: user.phone,
      },
    });
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
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'reset';
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
      res.json({ message: 'OTP sent successfully via email.' });
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
