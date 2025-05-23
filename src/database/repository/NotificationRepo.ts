import { Types, ModifyResult } from 'mongoose';
import Notification, { NotificationModel } from '../model/Notification';

async function create(notification: Notification): Promise<Notification> {
  const now = new Date();
  notification.createdAt = now;
  notification.updatedAt = now;
  return await NotificationModel.create(notification);
}

async function findById(id: Types.ObjectId): Promise<Notification | null> {
  return await NotificationModel.findById(id);
}

async function findByUser(
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 10,
): Promise<Notification[]> {
  return await NotificationModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

async function markAsRead(id: Types.ObjectId): Promise<Notification | null> {
  return await NotificationModel.findByIdAndUpdate(
    id,
    { isRead: true, updatedAt: new Date() },
    { new: true },
  );
}

async function markAllAsRead(userId: Types.ObjectId): Promise<void> {
  await NotificationModel.updateMany(
    { user: userId, isRead: false },
    { isRead: true, updatedAt: new Date() },
  );
}

async function getUnreadCount(userId: Types.ObjectId): Promise<number> {
  return await NotificationModel.countDocuments({
    user: userId,
    isRead: false,
  });
}

async function deleteNotification(
  id: Types.ObjectId,
): Promise<ModifyResult<Notification> | null> {
  return await NotificationModel.findByIdAndDelete(id);
}

export default {
  create,
  findById,
  findByUser,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
