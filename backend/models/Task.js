const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    patient: { type: String, required: true },
    type: { type: String, required: true },
    hours: { type: String, required: true },
    requirements: { type: String, required: true },
    daysLeft: { type: Number, required: true },
    score: { type: String, required: true },
    photo: { type: String }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
