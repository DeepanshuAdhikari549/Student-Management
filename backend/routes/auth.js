const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc Auth user & get token
// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Seed admin user (for demo purposes)
// @route POST /api/auth/seed
router.post('/seed', async (req, res) => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const adminExists = await User.findOne({ username: adminUsername });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already initialized. Use admin/admin123 if you didn\'t change it.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      username: adminUsername,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: 'Admin account created!', 
      details: `User: ${adminUsername}, Pass: ${adminPassword}` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing database' });
  }
});

module.exports = router;
