import { Types } from 'mongoose';
import TelemedicineChat, {
  TelemedicineChatModel,
} from '../model/TelemedicineChat';

async function create(
  chat: Partial<TelemedicineChat>,
): Promise<TelemedicineChat> {
  const createdChat = await TelemedicineChatModel.create(chat);
  return createdChat.toObject() as TelemedicineChat;
}

async function findBySessionId(
  sessionId: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<TelemedicineChat[]> {
  const chats = await TelemedicineChatModel.find({ session: sessionId })
    .populate('sender', 'name email profilePicUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return chats as TelemedicineChat[];
}

export default {
  create,
  findBySessionId,
};
