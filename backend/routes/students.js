const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @desc Get all students
// @route GET /api/students
router.get('/', protect, async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// @desc Add new student
// @route POST /api/students
router.post('/', protect, async (req, res) => {
  const { name, rollNumber, class: studentClass, email, phone } = req.body;

  try {
    const studentExists = await Student.findOne({ rollNumber });
    if (studentExists) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = await Student.create({
      name,
      rollNumber,
      class: studentClass,
      email,
      phone
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student' });
  }
});

// @desc Update student
// @route PUT /api/students/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      student.name = req.body.name || student.name;
      student.rollNumber = req.body.rollNumber || student.rollNumber;
      student.class = req.body.class || student.class;
      student.email = req.body.email || student.email;
      student.phone = req.body.phone || student.phone;

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating student' });
  }
});

// @desc Delete student
// @route DELETE /api/students/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      await student.deleteOne();
      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' });
  }
});

module.exports = router;
