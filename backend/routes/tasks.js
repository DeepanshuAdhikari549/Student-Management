const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

// @desc Get tasks (Admin shows all, Student shows only theirs)
// @route GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { student: req.user._id };
    const tasks = await Task.find(query).populate('student', 'name class rollNumber').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch Tasks Error:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// @desc Student submits work
// @route PATCH /api/tasks/:id/submit
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Task ID' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id },
      { 
        submission: req.body.submission, 
        status: 'Submitted' 
      },
      { new: true, runValidators: true }
    ).populate('student', 'name class rollNumber');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log(`Task ${id} submitted successfully`);
    res.json(task);
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ message: 'Error submitting task: ' + error.message });
  }
});

// @desc Add new task (Multi-student supported)
// @route POST /api/tasks
router.post('/', protect, async (req, res) => {
  const { title, description, student, dueDate, students } = req.body;

  try {
    const studentIds = students || [student];
    
    if (!studentIds || studentIds.length === 0 || !studentIds[0]) {
      return res.status(400).json({ message: 'No students selected' });
    }

    const taskPromises = studentIds.map(sId => 
      Task.create({ title, description, student: sId, dueDate })
    );

    const createdTasks = await Promise.all(taskPromises);
    
    const populated = await Task.find({ _id: { $in: createdTasks.map(t => t._id) } })
      .populate('student', 'name class rollNumber');
      
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Error creating tasks' });
  }
});

// @desc Mark task as completed/incomplete
// @route PATCH /api/tasks/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Task ID' });
    }

    const currentTask = await Task.findById(id);
    if (!currentTask) return res.status(404).json({ message: 'Task not found' });

    const isCompleted = req.body.completed !== undefined ? req.body.completed : !currentTask.completed;
    
    const task = await Task.findOneAndUpdate(
      { _id: id },
      { 
        completed: isCompleted,
        status: isCompleted ? 'Completed' : (currentTask.submission ? 'Submitted' : 'Pending')
      },
      { new: true }
    ).populate('student', 'name class rollNumber');

    console.log(`Task ${id} status updated to: ${task.status}`);
    res.json(task);
  } catch (error) {
    console.error('Toggle Task Error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// @desc Delete task
// @route DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
