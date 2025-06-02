import { Types } from 'mongoose';
import Message, { MessageModel } from '../model/Message';

async function create(messageData: Partial<Message>): Promise<Message> {
  const message = await MessageModel.create(messageData);
  return message.toObject() as Message;
}

async function findById(id: Types.ObjectId): Promise<Message | null> {
  const message = await MessageModel.findById(id)
    .populate('sender', 'name email profilePicUrl role')
    .populate('recipients', 'name email profilePicUrl role')
    .populate('conversation')
    .lean()
    .exec();
  return message as Message | null;
}

async function findByConversationId(
  conversationId: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<Message[]> {
  const messages = await MessageModel.find({ conversation: conversationId })
    .populate('sender', 'name email profilePicUrl role')
    .populate('recipients', 'name email profilePicUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as Message[];
}

async function findByUserId(
  userId: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<Message[]> {
  const messages = await MessageModel.find({
    $or: [{ sender: userId }, { recipients: userId }],
  })
    .populate('sender', 'name email profilePicUrl role')
    .populate('recipients', 'name email profilePicUrl role')
    .populate('conversation', 'title type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return messages as Message[];
}

async function updateStatus(
  messageId: Types.ObjectId,
  status: 'SENT' | 'DELIVERED' | 'READ',
): Promise<Message | null> {
  const message = await MessageModel.findByIdAndUpdate(
    messageId,
    { status },
    { new: true },
  )
    .populate('sender', 'name email profilePicUrl role')
    .populate('recipients', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as Message | null;
}

async function markAsRead(
  messageId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Message | null> {
  const message = await MessageModel.findByIdAndUpdate(
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
    .populate('recipients', 'name email profilePicUrl role')
    .lean()
    .exec();
  return message as Message | null;
}

async function getUnreadCount(userId: Types.ObjectId): Promise<number> {
  const count = await MessageModel.countDocuments({
    recipients: userId,
    'readBy.user': { $ne: userId },
  });
  return count;
}

async function findByPriority(
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
  limit: number = 50,
): Promise<Message[]> {
  const messages = await MessageModel.find({ priority })
    .populate('sender', 'name email profilePicUrl role')
    .populate('recipients', 'name email profilePicUrl role')
    .populate('conversation', 'title type')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
  return messages as Message[];
}

export default {
  create,
  findById,
  findByConversationId,
  findByUserId,
  updateStatus,
  markAsRead,
  getUnreadCount,
  findByPriority,
};
