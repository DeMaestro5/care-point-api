import { Types } from 'mongoose';
import {
  InventoryTransfer,
  InventoryTransferModel,
} from '../model/InventoryTransfer';

async function findById(id: Types.ObjectId): Promise<InventoryTransfer | null> {
  return InventoryTransferModel.findById(id)
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('completedBy', 'name email')
    .lean();
}

async function findByPharmacy(
  pharmacyId: Types.ObjectId,
  page = 1,
  limit = 20,
): Promise<InventoryTransfer[]> {
  const skip = (page - 1) * limit;
  return InventoryTransferModel.find({
    $or: [{ fromLocation: pharmacyId }, { toLocation: pharmacyId }],
  })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('completedBy', 'name email')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findByStatus(
  status: string,
  page = 1,
  limit = 20,
): Promise<InventoryTransfer[]> {
  const skip = (page - 1) * limit;
  return InventoryTransferModel.find({ status })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('completedBy', 'name email')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findPendingApprovals(
  page = 1,
  limit = 20,
): Promise<InventoryTransfer[]> {
  const skip = (page - 1) * limit;
  return InventoryTransferModel.find({ status: 'PENDING' })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function create(
  transfer: Partial<InventoryTransfer>,
): Promise<InventoryTransfer> {
  const now = new Date();
  transfer.createdAt = now;
  transfer.updatedAt = now;
  transfer.requestedAt = now;

  // Generate tracking number
  transfer.trackingNumber = `TRF-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 6)
    .toUpperCase()}`;

  const created = await InventoryTransferModel.create(transfer);
  return created.toObject();
}

async function updateStatus(
  id: Types.ObjectId,
  status: string,
  updatedBy: Types.ObjectId,
  notes?: string,
): Promise<InventoryTransfer | null> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  // Set appropriate timestamp based on status
  if (status === 'IN_TRANSIT' && !updateData.approvedBy) {
    updateData.approvedBy = updatedBy;
    updateData.approvedAt = new Date();
  } else if (status === 'COMPLETED') {
    updateData.completedBy = updatedBy;
    updateData.completedAt = new Date();
  }

  return InventoryTransferModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('completedBy', 'name email')
    .lean();
}

async function approve(
  id: Types.ObjectId,
  approvedBy: Types.ObjectId,
  estimatedDelivery?: Date,
  notes?: string,
): Promise<InventoryTransfer | null> {
  const updateData: any = {
    status: 'IN_TRANSIT',
    approvedBy,
    approvedAt: new Date(),
    updatedAt: new Date(),
  };

  if (estimatedDelivery) {
    updateData.estimatedDelivery = estimatedDelivery;
  }

  if (notes) {
    updateData.notes = notes;
  }

  return InventoryTransferModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .lean();
}

async function complete(
  id: Types.ObjectId,
  completedBy: Types.ObjectId,
  actualCost?: number,
  notes?: string,
): Promise<InventoryTransfer | null> {
  const updateData: any = {
    status: 'COMPLETED',
    completedBy,
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  if (actualCost !== undefined) {
    updateData.actualCost = actualCost;
  }

  if (notes) {
    updateData.notes = notes;
  }

  return InventoryTransferModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('completedBy', 'name email')
    .lean();
}

async function cancel(
  id: Types.ObjectId,
  reason: string,
): Promise<InventoryTransfer | null> {
  return InventoryTransferModel.findByIdAndUpdate(
    id,
    {
      status: 'CANCELLED',
      notes: reason,
      updatedAt: new Date(),
    },
    { new: true },
  )
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .lean();
}

async function getTransferHistory(
  medicationId: Types.ObjectId,
  pharmacyId?: Types.ObjectId,
): Promise<InventoryTransfer[]> {
  const query: any = {
    medication: medicationId,
    status: 'COMPLETED',
  };

  if (pharmacyId) {
    query.$or = [{ fromLocation: pharmacyId }, { toLocation: pharmacyId }];
  }

  return InventoryTransferModel.find(query)
    .populate('fromLocation', 'name address city')
    .populate('toLocation', 'name address city')
    .populate('medication', 'name genericName')
    .populate('requestedBy', 'name email')
    .populate('completedBy', 'name email')
    .sort({ completedAt: -1 })
    .limit(50)
    .lean();
}

export default {
  findById,
  findByPharmacy,
  findByStatus,
  findPendingApprovals,
  create,
  updateStatus,
  approve,
  complete,
  cancel,
  getTransferHistory,
};
