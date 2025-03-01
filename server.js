// Example of a correct MongoDB Atlas connection string
const mongoURI = "mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority";

// Make sure you're using this connection string correctly in your code
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Implement a complete and working search endpoint
app.get('/api/users/search', authenticateToken, (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  console.log(`Searching for user with username: ${username}`);
  
  readDatabase((err, db) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Make sure db.users exists
    if (!db.users || !Array.isArray(db.users)) {
      console.error('Users collection not found or not an array');
      return res.status(500).json({ error: 'Database structure error' });
    }
    
    // Case-insensitive search for username
    const user = db.users.find(u => 
      u.username && u.username.toLowerCase() === username.toLowerCase()
    );
    
    console.log('Search result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
});

// Add a new endpoint to get all users (with security measures)
app.get('/api/users/all', authenticateToken, (req, res) => {
  console.log('Request to get all users from:', req.user.username);
  
  // Read the database
  readDatabase((err, db) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Make sure db.users exists
    if (!db.users || !Array.isArray(db.users)) {
      console.error('Users collection not found or not an array');
      return res.status(500).json({ error: 'Database structure error' });
    }
    
    // Remove sensitive information from users
    const safeUsers = db.users.map(user => {
      // Extract only the fields we want to expose
      const { _id, username, name } = user;
      return { _id, username, name };
    });
    
    console.log(`Returning ${safeUsers.length} users`);
    res.json(safeUsers);
  });
});

// ...existing code...
