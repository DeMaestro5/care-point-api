import StaffRole, { StaffRoleModel } from '../model/StaffRole';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<StaffRole | null> {
  return StaffRoleModel.findOne({ _id: id, status: true }).lean().exec();
}

async function findByName(name: string): Promise<StaffRole | null> {
  return StaffRoleModel.findOne({ name, status: true }).lean().exec();
}

async function findAll(): Promise<StaffRole[]> {
  return StaffRoleModel.find({ status: true }).lean().exec();
}

async function create(staffRole: StaffRole): Promise<StaffRole> {
  const now = new Date();
  staffRole.createdAt = now;
  staffRole.updatedAt = now;
  const created = await StaffRoleModel.create(staffRole);
  return created.toObject();
}

async function update(staffRole: StaffRole): Promise<StaffRole | null> {
  staffRole.updatedAt = new Date();
  return StaffRoleModel.findByIdAndUpdate(staffRole._id, staffRole, {
    new: true,
  })
    .lean()
    .exec();
}

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const result = await StaffRoleModel.findByIdAndUpdate(id, {
    status: false,
    updatedAt: new Date(),
  });
  return !!result;
}

export default {
  findById,
  findByName,
  findAll,
  create,
  update,
  deleteById,
};
