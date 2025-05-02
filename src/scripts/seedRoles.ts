import mongoose from 'mongoose';
import { RoleModel, RoleCode } from '../database/model/Role';

async function seedRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/carepoint');
    console.log('Connected to MongoDB');

    const roles = Object.values(RoleCode).map((code) => ({
      code,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await RoleModel.insertMany(roles);
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedRoles();
