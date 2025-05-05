const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ✅ each class tied to a user
  title: { type: String, required: true },
  description: { type: String, required: true },
  insights: { type: String, default: "No insights yet — upload files to generate insights." },
  files: [
    { 
      filename: String,
      category: String,
      path: String
    }
  ]
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
