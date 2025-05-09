import { Types } from 'mongoose';
import { Inventory, InventoryModel } from '../model/Inventory';

async function findById(id: Types.ObjectId): Promise<Inventory | null> {
  return InventoryModel.findById(id).lean();
}

async function findByPharmacyId(
  pharmacyId: Types.ObjectId,
  page = 1,
  limit = 10,
): Promise<{ items: Inventory[]; total: number }> {
  const skip = (page - 1) * limit;
  const items = await InventoryModel.find({
    pharmacy: pharmacyId,
    status: true,
  })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await InventoryModel.countDocuments({
    pharmacy: pharmacyId,
    status: true,
  });
  return { items, total };
}

async function create(inventory: Partial<Inventory>): Promise<Inventory> {
  const now = new Date();
  inventory.createdAt = now;
  inventory.updatedAt = now;
  const created = await InventoryModel.create(inventory);
  return created.toObject();
}

async function update(inventory: Partial<Inventory>): Promise<Inventory> {
  const now = new Date();
  inventory.updatedAt = now;
  const updated = await InventoryModel.findByIdAndUpdate(
    inventory._id,
    inventory,
    { new: true },
  ).lean();
  if (!updated) throw new Error('Inventory not found');
  return updated;
}

export default {
  findById,
  findByPharmacyId,
  create,
  update,
};
