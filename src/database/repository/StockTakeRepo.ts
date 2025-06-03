import { Types } from 'mongoose';
import { StockTake, StockTakeModel } from '../model/StockTake';

async function findById(id: Types.ObjectId): Promise<StockTake | null> {
  return StockTakeModel.findById(id)
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('items.medication', 'name genericName')
    .lean();
}

async function findByPharmacy(
  pharmacyId: Types.ObjectId,
  page = 1,
  limit = 20,
): Promise<StockTake[]> {
  const skip = (page - 1) * limit;
  return StockTakeModel.find({ pharmacy: pharmacyId })
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ stockTakeDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findByStatus(
  status: string,
  page = 1,
  limit = 20,
): Promise<StockTake[]> {
  const skip = (page - 1) * limit;
  return StockTakeModel.find({ status })
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ stockTakeDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function findPendingReview(page = 1, limit = 20): Promise<StockTake[]> {
  const skip = (page - 1) * limit;
  return StockTakeModel.find({ status: 'COMPLETED', reviewedBy: null })
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function create(stockTake: Partial<StockTake>): Promise<StockTake> {
  const now = new Date();
  stockTake.createdAt = now;
  stockTake.updatedAt = now;
  stockTake.startedAt = now;

  const created = await StockTakeModel.create(stockTake);
  return created.toObject();
}

async function addItems(
  id: Types.ObjectId,
  items: any[],
): Promise<StockTake | null> {
  // Calculate variances for each item
  const itemsWithVariance = items.map((item) => ({
    ...item,
    variance: item.actualQuantity - item.expectedQuantity,
  }));

  // Calculate total variance and variance value
  const totalVariance = itemsWithVariance.reduce(
    (sum, item) => sum + Math.abs(item.variance),
    0,
  );

  const updatedStockTake = await StockTakeModel.findByIdAndUpdate(
    id,
    {
      $push: { items: { $each: itemsWithVariance } },
      totalVariance,
      updatedAt: new Date(),
    },
    { new: true },
  )
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('items.medication', 'name genericName')
    .lean();

  return updatedStockTake;
}

async function updateStatus(
  id: Types.ObjectId,
  status: string,
  updatedBy?: Types.ObjectId,
): Promise<StockTake | null> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  if (status === 'COMPLETED' && updatedBy) {
    // Mark as reviewed if completed by a different user
    const stockTake = await StockTakeModel.findById(id);
    if (stockTake && !stockTake.conductedBy.equals(updatedBy)) {
      updateData.reviewedBy = updatedBy;
      updateData.reviewedAt = new Date();
    }
  }

  return StockTakeModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('items.medication', 'name genericName')
    .lean();
}

async function review(
  id: Types.ObjectId,
  reviewedBy: Types.ObjectId,
  notes?: string,
): Promise<StockTake | null> {
  const updateData: any = {
    reviewedBy,
    reviewedAt: new Date(),
    updatedAt: new Date(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  return StockTakeModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate('pharmacy', 'name address city')
    .populate('conductedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('items.medication', 'name genericName')
    .lean();
}

async function getVarianceReport(
  pharmacyId?: Types.ObjectId,
  startDate?: Date,
  endDate?: Date,
): Promise<any[]> {
  const matchConditions: any = {
    status: 'COMPLETED',
  };

  if (pharmacyId) {
    matchConditions.pharmacy = pharmacyId;
  }

  if (startDate && endDate) {
    matchConditions.stockTakeDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  return StockTakeModel.aggregate([
    { $match: matchConditions },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medication',
        totalVariance: { $sum: '$items.variance' },
        positiveVariance: {
          $sum: {
            $cond: [{ $gt: ['$items.variance', 0] }, '$items.variance', 0],
          },
        },
        negativeVariance: {
          $sum: {
            $cond: [{ $lt: ['$items.variance', 0] }, '$items.variance', 0],
          },
        },
        stockTakeCount: { $sum: 1 },
        averageVariance: { $avg: '$items.variance' },
      },
    },
    {
      $lookup: {
        from: 'medications',
        localField: '_id',
        foreignField: '_id',
        as: 'medication',
      },
    },
    { $unwind: '$medication' },
    {
      $project: {
        medicationName: '$medication.name',
        genericName: '$medication.genericName',
        totalVariance: 1,
        positiveVariance: 1,
        negativeVariance: 1,
        stockTakeCount: 1,
        averageVariance: 1,
      },
    },
    { $sort: { totalVariance: -1 } },
  ]);
}

async function getStockTakeStats(
  pharmacyId?: Types.ObjectId,
  startDate?: Date,
  endDate?: Date,
): Promise<any> {
  const matchConditions: any = {};

  if (pharmacyId) {
    matchConditions.pharmacy = pharmacyId;
  }

  if (startDate && endDate) {
    matchConditions.stockTakeDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const stats = await StockTakeModel.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalStockTakes: { $sum: 1 },
        completedStockTakes: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
        },
        draftStockTakes: {
          $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] },
        },
        inProgressStockTakes: {
          $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] },
        },
        averageVariance: { $avg: '$totalVariance' },
        totalVarianceValue: { $sum: '$varianceValue' },
      },
    },
  ]);

  return (
    stats[0] || {
      totalStockTakes: 0,
      completedStockTakes: 0,
      draftStockTakes: 0,
      inProgressStockTakes: 0,
      averageVariance: 0,
      totalVarianceValue: 0,
    }
  );
}

export default {
  findById,
  findByPharmacy,
  findByStatus,
  findPendingReview,
  create,
  addItems,
  updateStatus,
  review,
  getVarianceReport,
  getStockTakeStats,
};
