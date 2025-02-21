const mongoose = require('mongoose');
const Contact = require('../src/models/contactModel'); // Ensure this model file exists
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neoMessenger';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  seedContacts();
})
.catch(err => {
  console.error('Database connection error:', err);
});

async function seedContacts() {
  // Replace this userId with one present in your users collection.
  const sampleUserId = "67b522f5228d45528c53dfea"; 

  const sampleContacts = [
    { userId: sampleUserId, name: "Alice", email: "alice@example.com" },
    
  ];

  try {
    // Clear current contacts for clean seeding
    await Contact.deleteMany({});
    const contacts = await Contact.insertMany(sampleContacts);
    console.log(`Inserted ${contacts.length} contacts.`);
    process.exit();
  } catch (err) {
    console.error('Error inserting contacts:', err);
    process.exit(1);
  }
}
