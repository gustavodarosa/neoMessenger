const fs = require('fs');
const path = require('path');

// Path to your database file
const dbPath = path.join(__dirname, 'database.json');

// Read the database
fs.readFile(dbPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading database file:', err);
    return;
  }
  
  try {
    const db = JSON.parse(data);
    
    // Check users collection
    console.log('\n---- DATABASE USERS CHECK ----');
    if (!db.users || !Array.isArray(db.users)) {
      console.log('Users collection not found or not an array');
    } else {
      console.log(`Found ${db.users.length} users in database`);
      
      // List all usernames
      console.log('\nUsernames in database:');
      db.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username || 'No username'} (${user._id || 'No ID'})`);
      });
      
      // Check specifically for 'teste' username
      const testeUsers = db.users.filter(u => u.username && u.username.toLowerCase() === 'teste');
      console.log(`\nFound ${testeUsers.length} users with username 'teste'`);
      testeUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}, Name: ${user.name || 'No name'}`);
      });
    }
  } catch (error) {
    console.error('Error parsing database JSON:', error);
  }
});

console.log('Running database check...');
