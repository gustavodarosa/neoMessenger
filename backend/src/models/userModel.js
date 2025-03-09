const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio:      { type: String, default: "" },
  avatar:   { type: String },
  status:   { type: String, enum: ['online', 'ausente', 'ocupado', 'invisivel', 'offline'], default: 'online' },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);