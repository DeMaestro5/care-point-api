require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function insertRoles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('care-point-db');

    // Insert roles
    const result = await db.collection('roles').insertMany([
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

    console.log('Roles inserted:', result);
  } catch (err) {
    console.error('Error inserting roles:', err);
  } finally {
    await client.close();
  }
}

insertRoles();
