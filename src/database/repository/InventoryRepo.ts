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
  const query = { pharmacy: pharmacyId, status: true };

  const [items, total] = await Promise.all([
    InventoryModel.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    InventoryModel.countDocuments(query),
  ]);

  return { items, total };
}

async function findByMedicationId(
  medicationId: Types.ObjectId,
): Promise<Inventory[]> {
  return InventoryModel.find({
    medication: medicationId,
    status: true,
  })
    .populate('pharmacy', 'name address coordinates')
    .lean();
}

async function create(inventory: Partial<Inventory>): Promise<Inventory> {
  const now = new Date();
  inventory.createdAt = now;
  inventory.updatedAt = now;
  const created = await InventoryModel.create(inventory);
  return created.toObject();
}

async function update(
  inventory: Partial<Inventory>,
): Promise<Inventory | null> {
  inventory.updatedAt = new Date();
  return InventoryModel.findByIdAndUpdate(inventory._id, inventory, {
    new: true,
  }).lean();
}

async function deleteInventory(id: Types.ObjectId): Promise<Inventory | null> {
  return InventoryModel.findByIdAndUpdate(
    id,
    { status: false, updatedAt: new Date() },
    { new: true },
  ).lean();
}

async function batchUpdate(
  pharmacyId: Types.ObjectId,
  updates: Array<{
    medicationId: string;
    quantity: number;
    price: number;
    expiryDate?: Date;
    batchNumber?: string;
  }>,
): Promise<Inventory[]> {
  const results: Inventory[] = [];

  for (const update of updates) {
    const existingInventory = await InventoryModel.findOne({
      pharmacy: pharmacyId,
      medication: new Types.ObjectId(update.medicationId),
      status: true,
    });

    if (existingInventory) {
      // Update existing inventory
      const updated = await InventoryModel.findByIdAndUpdate(
        existingInventory._id,
        {
          quantity: update.quantity,
          price: update.price,
          expiryDate: update.expiryDate,
          batchNumber: update.batchNumber,
          updatedAt: new Date(),
        },
        { new: true },
      ).lean();
      if (updated) results.push(updated);
    } else {
      // Create new inventory entry
      const created = await create({
        pharmacy: pharmacyId,
        medication: new Types.ObjectId(update.medicationId),
        quantity: update.quantity,
        price: update.price,
        expiryDate: update.expiryDate,
        batchNumber: update.batchNumber,
        status: true,
      });
      results.push(created);
    }
  }

  return results;
}

export default {
  findById,
  findByPharmacyId,
  findByMedicationId,
  create,
  update,
  delete: deleteInventory,
  batchUpdate,
};
