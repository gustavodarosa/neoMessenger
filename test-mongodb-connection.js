const { MongoClient } = require('mongodb');

// Replace with your connection string
const uri = "mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
    
    // List all databases in the cluster
    const dbs = await client.db().admin().listDatabases();
    console.log("Available databases:");
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

testConnection();
