const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
async function init() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('care-point-db');

    // Create collections if they don't exist
    await db.createCollection('api_keys');
    await db.createCollection('roles');

    // Insert API key
    await db.collection('api_keys').insertOne({
      key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj',
      permissions: ['GENERAL'],
      comments: ['To be used by the xyz vendor'],
      version: 1,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert roles
    await db.collection('roles').insertMany([
      {
        code: 'DOCTOR',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'PATIENT',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'AMBULANCE',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'PHARMACY',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('Initialization completed successfully');
  } catch (err) {
    console.error('Error during initialization:', err);
  } finally {
    await client.close();
  }
}

init();
