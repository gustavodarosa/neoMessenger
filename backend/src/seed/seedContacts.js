const mongoose = require('mongoose');
const User = require('../models/userModel');
const Contact = require('../models/contactModel');
require('dotenv').config();

// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to create random contacts between users
async function seedContacts() {
  try {
    // Clear existing contacts
    await Contact.deleteMany({});
    console.log('Deleted existing contacts');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    if (users.length < 2) {
      console.log('Need at least 2 users to create contacts');
      return;
    }
    
    const contacts = [];
    
    // Create some connections between users (not all users will be connected)
    for (let i = 0; i < users.length; i++) {
      // Each user will have 1-3 random contacts
      const numContacts = Math.floor(Math.random() * 3) + 1;
      const maxContacts = Math.min(numContacts, users.length - 1);
      
      const contactIndices = new Set();
      while (contactIndices.size < maxContacts) {
        const randomIndex = Math.floor(Math.random() * users.length);
        if (randomIndex !== i) {
          contactIndices.add(randomIndex);
        }
      }
      
      // Create the contacts
      for (const contactIndex of contactIndices) {
        const newContact = new Contact({
          userId: users[i]._id,
          contactId: users[contactIndex]._id
        });
        contacts.push(newContact);
        
        console.log(`Created contact: ${users[i].username} -> ${users[contactIndex].username}`);
      }
    }
    
    // Save all the contacts
    await Promise.all(contacts.map(contact => contact.save()));
    console.log(`Created ${contacts.length} contacts`);
    
  } catch (error) {
    console.error('Error seeding contacts:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Check if Contact model exists
if (!Contact || !Contact.schema) {
  console.error('Contact model is not properly defined');
  process.exit(1);
}

// Run the seed function
seedContacts();
