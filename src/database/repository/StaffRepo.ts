import Staff, { StaffModel, StaffRole } from '../model/Staff';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Staff | null> {
  // Try finding by staff ID first
  let staff = await StaffModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();

  // If not found, try finding by user ID
  if (!staff) {
    staff = await StaffModel.findOne({ user: id, status: true })
      .populate('user', 'name email profilePicUrl')
      .lean()
      .exec();
  }

  return staff;
}

async function findByUserId(userId: Types.ObjectId): Promise<Staff | null> {
  return StaffModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function findByEmployeeId(employeeId: string): Promise<Staff | null> {
  return StaffModel.findOne({ employeeId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function create(staff: Staff): Promise<Staff> {
  const now = new Date();
  staff.createdAt = now;
  staff.updatedAt = now;
  const created = await StaffModel.create(staff);
  return created.toObject();
}

async function update(staff: Staff): Promise<Staff | null> {
  staff.updatedAt = new Date();
  return StaffModel.findByIdAndUpdate(staff._id, staff, { new: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function searchStaff({
  page = 1,
  limit = 10,
  role,
  department,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  role?: StaffRole;
  department?: string;
  status?: boolean;
  search?: string;
}) {
  const query: any = { status: true };

  if (role) {
    query.role = role;
  }

  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  if (typeof status === 'boolean') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { employeeId: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
  }

  const [staff, total] = await Promise.all([
    StaffModel.find(query)
      .populate('user', 'name email profilePicUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    StaffModel.countDocuments(query),
  ]);

  return {
    staff,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

async function updateSchedule(
  staffId: Types.ObjectId,
  schedule: Staff['schedule'],
): Promise<Staff | null> {
  return StaffModel.findByIdAndUpdate(
    staffId,
    {
      schedule,
      updatedAt: new Date(),
    },
    { new: true },
  )
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function findByRole(role: StaffRole): Promise<Staff[]> {
  return StaffModel.find({ role, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function count(filters: any = {}): Promise<number> {
  return StaffModel.countDocuments(filters).exec();
}

export default {
  findById,
  findByUserId,
  findByEmployeeId,
  create,
  update,
  searchStaff,
  updateSchedule,
  findByRole,
  count,
};
