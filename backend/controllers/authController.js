require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const mailer = require('../utils/mailer');
const {setResetRequest, getResetRequest, deleteResetRequest} = require('../utils/resetRequests');
const emailService = require('../utils/emailService');

let tempUsers = {};

function validateRegisterBody(body) {
    const { firstName, lastName, address, contactNo, email, password } = body;
    if (!firstName || !lastName || !address || !contactNo || !email || !password) {
        return false;
    }
    return true;
}

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const { password, __v, ...safe } = userDoc.toObject ? userDoc.toObject() : userDoc;
  return safe;
};

exports.requestOtp = async (req, res) => {
    const { firstName, lastName, address, contactNo, email, password } = req.body;

    try {
        if (!validateRegisterBody(req.body)) {
            return res.status(400).json({ success: false, message: 'All registration fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        tempUsers[email] = {
            otp,
            expires: Date.now() + 5 * 60 * 1000,
            userData: { firstName, lastName, address, contactNo, email, password }
        };

        const subject = 'Your OTP Code';
        const html = `<p>Your OTP code is: <strong>${otp}</strong></p><p>It will expire in 5 minutes.</p>`;

        try {
            await mailer(email, subject, html);
            return res.status(200).json({ success: true, message: 'OTP sent to email.' });
        } catch (mailErr) {
            delete tempUsers[email];
            return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
        }

        const record = tempUsers[email];
        if (!record) return res.status(400).json({ success: false, message: 'No OTP request found for this email.' });

        if (Date.now() > record.expires) {
            delete tempUsers[email];
            return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
        }

        if (record.otp !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        const already = await User.findOne({ email });
        if (already) {
            delete tempUsers[email];
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const plainPassword = record.userData.password;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newUser = new User({
            firstName: record.userData.firstName,
            lastName: record.userData.lastName,
            address: record.userData.address,
            contactNo: record.userData.contactNo,
            email: record.userData.email,
            password: hashedPassword,
            isVerified: true
        });

        await newUser.save();

        await emailService.sendRegistrationSuccessEmail(newUser.email, newUser.firstName);
        
        delete tempUsers[email];

        return res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.forgotPasswordRequestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'No user found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setResetRequest(email, otp, Date.now() + 5 * 60 * 1000);

    const subject = 'Reset Your Password';
    const html = `<p>Your OTP for resetting password is: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`;

    try {
        await mailer(email, subject, html);
        return res.status(200).json({ success: true, message: 'OTP sent to email.' });
    } catch (err) {
        deleteResetRequest(email);
        return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
    }
};

exports.resetPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const record = getResetRequest(email);
    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP request found.' });
    }

    if (Date.now() > record.expires) {
        deleteResetRequest(email);
        return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
    }

    if (record.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    const user = await User.findOne({ email });
    if (user) {
        await emailService.sendPasswordChangeConfirmation(user.email, user.firstName);
    }

    deleteResetRequest(email);
    return res.status(200).json({ success: true, message: 'Password reset successful.' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not registered.'
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    if (req.session) {
      req.session.user = { id: user._id, email: user.email };
    }

    const safeUser = sanitizeUser(user);
    const sessionId = req.sessionID || null;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      sessionId, 
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.logout = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error('Logout error', err);
          return res.status(500).json({ success: false, message: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid'); 
        return res.status(200).json({ success: true, message: 'Logged out successfully.' });
      });
    } else {
      return res.status(200).json({ success: true, message: 'No active session.' });
    }
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};