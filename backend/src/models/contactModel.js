const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['online', 'ausente', 'ocupado', 'invisivel'], default: 'online' },
});

module.exports = mongoose.model('Contact', contactSchema);
