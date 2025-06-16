const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const isStrongPassword = (password) => password.length >= 6;

module.exports = { isValidEmail, isStrongPassword };
