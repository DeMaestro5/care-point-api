import { Types } from 'mongoose';
import BroadcastMessage, {
  BroadcastMessageModel,
} from '../model/BroadcastMessage';

async function create(
  messageData: Partial<BroadcastMessage>,
): Promise<BroadcastMessage> {
  const message = await BroadcastMessageModel.create(messageData);
  return message.toObject() as BroadcastMessage;
}

async function findById(id: Types.ObjectId): Promise<BroadcastMessage | null> {
  const message = await BroadcastMessageModel.findById(id)
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as BroadcastMessage | null;
}

async function findAll(
  limit: number = 50,
  skip: number = 0,
): Promise<BroadcastMessage[]> {
  const messages = await BroadcastMessageModel.find()
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function findBySender(
  senderId: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<BroadcastMessage[]> {
  const messages = await BroadcastMessageModel.find({ sender: senderId })
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function findByStatus(
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED',
  limit: number = 50,
): Promise<BroadcastMessage[]> {
  const messages = await BroadcastMessageModel.find({ status })
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function findScheduledMessages(): Promise<BroadcastMessage[]> {
  const now = new Date();
  const messages = await BroadcastMessageModel.find({
    status: 'SCHEDULED',
    scheduledAt: { $lte: now },
  })
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function updateStatus(
  messageId: Types.ObjectId,
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED',
  sentAt?: Date,
): Promise<BroadcastMessage | null> {
  const updateData: any = { status };
  if (sentAt) {
    updateData.sentAt = sentAt;
  }

  const message = await BroadcastMessageModel.findByIdAndUpdate(
    messageId,
    updateData,
    { new: true },
  )
    .populate('sender', 'name email profilePicUrl role')
    .populate('specificRecipients', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as BroadcastMessage | null;
}

async function updateDeliveryStats(
  messageId: Types.ObjectId,
  stats: { sent?: number; delivered?: number; read?: number },
): Promise<BroadcastMessage | null> {
  const updateData: any = {};
  if (stats.sent !== undefined) updateData['deliveryStats.sent'] = stats.sent;
  if (stats.delivered !== undefined)
    updateData['deliveryStats.delivered'] = stats.delivered;
  if (stats.read !== undefined) updateData['deliveryStats.read'] = stats.read;

  const message = await BroadcastMessageModel.findByIdAndUpdate(
    messageId,
    updateData,
    { new: true },
  )
    .populate('sender', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as BroadcastMessage | null;
}

async function markAsRead(
  messageId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<BroadcastMessage | null> {
  const message = await BroadcastMessageModel.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date(),
        },
      },
    },
    { new: true },
  )
    .populate('sender', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as BroadcastMessage | null;
}

async function findByTargetAudience(
  targetAudience: 'ALL' | 'PATIENTS' | 'DOCTORS' | 'STAFF' | 'SPECIFIC',
  userId?: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<BroadcastMessage[]> {
  const query: any = {
    status: 'SENT',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  };

  if (targetAudience === 'SPECIFIC' && userId) {
    query.specificRecipients = userId;
  } else if (targetAudience !== 'ALL') {
    query.targetAudience = { $in: [targetAudience, 'ALL'] };
  }

  const messages = await BroadcastMessageModel.find(query)
    .populate('sender', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function findByTargetAudienceAllStatuses(
  targetAudience: 'ALL' | 'PATIENTS' | 'DOCTORS' | 'STAFF' | 'SPECIFIC',
  userId?: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<BroadcastMessage[]> {
  const query: any = {};

  if (targetAudience === 'SPECIFIC' && userId) {
    query.specificRecipients = userId;
  } else if (targetAudience !== 'ALL') {
    query.targetAudience = { $in: [targetAudience, 'ALL'] };
  }

  const messages = await BroadcastMessageModel.find(query)
    .populate('sender', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as BroadcastMessage[];
}

async function deleteExpiredMessages(): Promise<number> {
  const result = await BroadcastMessageModel.deleteMany({
    expiresAt: { $lt: new Date() },
    status: 'SENT',
  });
  return result.deletedCount || 0;
}

export default {
  create,
  findById,
  findAll,
  findBySender,
  findByStatus,
  findScheduledMessages,
  updateStatus,
  updateDeliveryStats,
  markAsRead,
  findByTargetAudience,
  findByTargetAudienceAllStatuses,
  deleteExpiredMessages,
};
