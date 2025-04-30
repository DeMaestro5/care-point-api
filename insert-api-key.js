require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function insertApiKey() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('care-point-db');

    // Insert API key
    const result = await db.collection('api_keys').insertOne({
      key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj',
      permissions: ['GENERAL'],
      comments: ['To be used by the xyz vendor'],
      version: 1,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('API key inserted:', result);
  } catch (err) {
    console.error('Error inserting API key:', err);
  } finally {
    await client.close();
  }
}

insertApiKey();
