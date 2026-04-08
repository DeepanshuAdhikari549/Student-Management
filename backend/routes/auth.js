const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

// @desc Auth user & get token
// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Try finding in Admin User first
    let user = await User.findOne({ username });
    let role = 'admin';

    // If not found, try finding in Student collection (using rollNumber as username)
    if (!user) {
      user = await Student.findOne({ rollNumber: username });
      role = 'student';
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username || user.rollNumber,
        name: user.name || 'Admin',
        role: user.role || role,
        token: jwt.sign({ id: user._id, role: user.role || role }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Register a new student
// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, rollNumber, class: studentClass, email, password } = req.body;

  try {
    const studentExists = await Student.findOne({ rollNumber });
    if (studentExists) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      rollNumber,
      class: studentClass,
      email,
      password: hashedPassword,
      role: 'student'
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      role: 'student',
      token: jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '30d' })
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
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
