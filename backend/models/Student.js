const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true, default: 'student123' }, // Default password
  role: { type: String, default: 'student' }
}, { timestamps: true });

// Match password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password || await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
