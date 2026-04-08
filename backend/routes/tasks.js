const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @desc Get tasks (Admin shows all, Student shows only theirs)
// @route GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { student: req.user._id };
    const tasks = await Task.find(query).populate('student', 'name class rollNumber').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// @desc Student submits work
// @route PATCH /api/tasks/:id/submit
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task.submission = req.body.submission;
    task.status = 'Submitted';
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting task' });
  }
});

// @desc Add new task (Multi-student supported)
// @route POST /api/tasks
router.post('/', protect, async (req, res) => {
  const { title, description, student, dueDate, students } = req.body;

  try {
    // Check if we are sending an array of students or a single one
    const studentIds = students || [student];
    
    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: 'No students selected' });
    }

    const taskPromises = studentIds.map(sId => 
      Task.create({ title, description, student: sId, dueDate })
    );

    const createdTasks = await Promise.all(taskPromises);
    
    // Return the first one populated for UI feedback, or just a success message
    const populated = await Task.find({ _id: { $in: createdTasks.map(t => t._id) } })
      .populate('student', 'name class rollNumber');
      
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tasks' });
  }
});

// @desc Mark task as completed/incomplete
// @route PATCH /api/tasks/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      task.completed = req.body.completed !== undefined ? req.body.completed : !task.completed;
      task.status = task.completed ? 'Completed' : (task.submission ? 'Submitted' : 'Pending');
      const updatedTask = await task.save();
      const populatedTask = await Task.findById(updatedTask._id).populate('student', 'name class rollNumber');
      res.json(populatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// @desc Delete task
// @route DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
