const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio:      { type: String, default: "" },
  status:   { type: String, enum: ['online', 'ausente', 'ocupado', 'invisivel'], default: 'online' },
  avatar:   { type: String, default: "/assets/avatar.png" }
});

module.exports = mongoose.model('User', userSchema);