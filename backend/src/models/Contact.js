const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the contact
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The actual user ID this contact represents
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['online', 'ausente', 'ocupado', 'invisivel'], default: 'online' }
});

module.exports = mongoose.model('Contact', contactSchema);
