import { Types } from 'mongoose';
import { FamilyMemberModel } from '../model/FamilyMember';
import FamilyMember from '../model/FamilyMember';

class FamilyMemberRepo {
  async create(familyMember: Omit<FamilyMember, '_id'>): Promise<FamilyMember> {
    const now = new Date();
    familyMember.createdAt = now;
    familyMember.updatedAt = now;
    const created = await FamilyMemberModel.create(familyMember);
    return created.toObject();
  }

  async findByPatientId(
    patientId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ familyMembers: FamilyMember[]; total: number }> {
    const skip = (page - 1) * limit;
    const [familyMembers, total] = await Promise.all([
      FamilyMemberModel.find({ patientId, status: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FamilyMemberModel.countDocuments({ patientId, status: true }),
    ]);

    return { familyMembers, total };
  }

  async findById(id: Types.ObjectId): Promise<FamilyMember | null> {
    return FamilyMemberModel.findOne({ _id: id, status: true }).lean();
  }

  async update(
    id: Types.ObjectId,
    update: Partial<FamilyMember>,
  ): Promise<FamilyMember | null> {
    update.updatedAt = new Date();
    return FamilyMemberModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    ).lean();
  }

  async delete(id: Types.ObjectId): Promise<FamilyMember | null> {
    return FamilyMemberModel.findByIdAndUpdate(
      id,
      { $set: { status: false, updatedAt: new Date() } },
      { new: true },
    ).lean();
  }
}

export default new FamilyMemberRepo();
