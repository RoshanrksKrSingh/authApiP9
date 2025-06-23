const User = require('../models/userModel');
const { isValidEmail, isStrongPassword } = require('../utils/validators');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  const { username, email, password, currentPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      // Check for unique email
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      user.password = password; // Assume pre-save hook hashes password
    }

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting profile' });
  }
};

module.exports = { getProfile, updateProfile, deleteProfile };
