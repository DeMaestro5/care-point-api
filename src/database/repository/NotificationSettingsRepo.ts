import { Types } from 'mongoose';
import NotificationSettings, {
  NotificationSettingsModel,
} from '../model/NotificationSettings';

async function create(
  settings: NotificationSettings,
): Promise<NotificationSettings> {
  const now = new Date();
  settings.createdAt = now;
  settings.updatedAt = now;
  return await NotificationSettingsModel.create(settings);
}

async function findByUser(
  userId: Types.ObjectId,
): Promise<NotificationSettings | null> {
  return await NotificationSettingsModel.findOne({ user: userId });
}

async function update(
  userId: Types.ObjectId,
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings | null> {
  return await NotificationSettingsModel.findOneAndUpdate(
    { user: userId },
    { ...settings, updatedAt: new Date() },
    { new: true },
  );
}

async function getOrCreate(
  userId: Types.ObjectId,
): Promise<NotificationSettings> {
  let settings = await this.findByUser(userId);
  if (!settings) {
    settings = await this.create({
      user: userId,
    } as NotificationSettings);
  }
  return settings;
}

export default {
  create,
  findByUser,
  update,
  getOrCreate,
};
