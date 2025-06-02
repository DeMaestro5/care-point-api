import { Types } from 'mongoose';
import Conversation, { ConversationModel } from '../model/Conversation';

async function create(
  conversationData: Partial<Conversation>,
): Promise<Conversation> {
  const conversation = await ConversationModel.create(conversationData);
  return conversation.toObject() as Conversation;
}

async function findById(id: Types.ObjectId): Promise<Conversation | null> {
  const conversation = await ConversationModel.findById(id)
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .populate('createdBy', 'name email role')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function findByParticipants(
  participantIds: Types.ObjectId[],
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findOne({
    participants: { $all: participantIds },
    type: 'DIRECT',
  })
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function findByUserId(
  userId: Types.ObjectId,
  limit: number = 50,
  skip: number = 0,
): Promise<Conversation[]> {
  const conversations = await ConversationModel.find({
    participants: userId,
    isArchived: false,
  })
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .populate('createdBy', 'name email role')
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return conversations as Conversation[];
}

async function updateLastMessage(
  conversationId: Types.ObjectId,
  messageId: Types.ObjectId,
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: messageId,
      lastActivity: new Date(),
    },
    { new: true },
  )
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function archiveConversation(
  conversationId: Types.ObjectId,
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    { isArchived: true },
    { new: true },
  )
    .populate('participants', 'name email profilePicUrl role')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function unarchiveConversation(
  conversationId: Types.ObjectId,
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    { isArchived: false },
    { new: true },
  )
    .populate('participants', 'name email profilePicUrl role')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function addParticipant(
  conversationId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: { participants: userId },
      lastActivity: new Date(),
    },
    { new: true },
  )
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function removeParticipant(
  conversationId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Conversation | null> {
  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      $pull: { participants: userId },
      lastActivity: new Date(),
    },
    { new: true },
  )
    .populate('participants', 'name email profilePicUrl role')
    .populate('lastMessage')
    .lean()
    .exec();
  return conversation as Conversation | null;
}

async function getOrCreateDirectConversation(
  user1Id: Types.ObjectId,
  user2Id: Types.ObjectId,
): Promise<Conversation> {
  // Try to find existing conversation
  let conversation = await findByParticipants([user1Id, user2Id]);

  if (!conversation) {
    // Create new conversation
    conversation = await create({
      participants: [user1Id, user2Id],
      type: 'DIRECT',
      createdBy: user1Id,
      lastActivity: new Date(),
    });
  }

  return conversation;
}

export default {
  create,
  findById,
  findByParticipants,
  findByUserId,
  updateLastMessage,
  archiveConversation,
  unarchiveConversation,
  addParticipant,
  removeParticipant,
  getOrCreateDirectConversation,
};
