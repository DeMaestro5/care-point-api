import { Types } from 'mongoose';
import { Order, OrderModel } from '../model/Order';

async function findById(id: Types.ObjectId): Promise<Order | null> {
  return OrderModel.findById(id)
    .populate('pharmacy', 'name')
    .populate('items.inventory', 'name price')
    .lean()
    .exec() as Promise<Order | null>;
}

async function findByPharmacyId(
  pharmacyId: Types.ObjectId,
  page = 1,
  limit = 10,
  filter: any = {},
): Promise<{ orders: Order[]; total: number }> {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    OrderModel.find({ pharmacy: pharmacyId, ...filter })
      .populate('items.inventory', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<Order[]>,
    OrderModel.countDocuments({ pharmacy: pharmacyId, ...filter }),
  ]);

  return { orders, total };
}

async function create(order: Partial<Order>): Promise<Order> {
  const now = new Date();
  order.createdAt = now;
  order.updatedAt = now;
  const created = await OrderModel.create(order);
  return created.toObject();
}

async function update(
  id: Types.ObjectId,
  data: Partial<Order>,
): Promise<Order | null> {
  data.updatedAt = new Date();
  return OrderModel.findByIdAndUpdate(id, data, { new: true })
    .populate('pharmacy', 'name')
    .populate('items.inventory', 'name price')
    .lean()
    .exec() as Promise<Order | null>;
}

export default {
  findById,
  findByPharmacyId,
  create,
  update,
};
