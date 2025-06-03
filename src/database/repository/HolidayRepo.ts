import Holiday, {
  HolidayModel,
  HolidayType,
  OperationalStatus,
} from '../model/Holiday';
import { Types } from 'mongoose';

async function create(holiday: Partial<Holiday>): Promise<Holiday> {
  const now = new Date();
  const holidayDoc = new HolidayModel({
    ...holiday,
    createdAt: now,
    updatedAt: now,
  });
  return await holidayDoc.save();
}

async function findById(id: Types.ObjectId): Promise<Holiday | null> {
  return await HolidayModel.findById(id).lean();
}

async function findAll(isActive: boolean = true): Promise<Holiday[]> {
  return await HolidayModel.find({ isActive }).sort({ date: 1 }).lean();
}

async function findByDateRange(
  startDate: Date,
  endDate: Date,
  isActive: boolean = true,
): Promise<Holiday[]> {
  return await HolidayModel.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    isActive,
  })
    .sort({ date: 1 })
    .lean();
}

async function findByDate(
  date: Date,
  isActive: boolean = true,
): Promise<Holiday | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await HolidayModel.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    isActive,
  }).lean();
}

async function findByType(
  type: HolidayType,
  isActive: boolean = true,
): Promise<Holiday[]> {
  return await HolidayModel.find({ type, isActive }).sort({ date: 1 }).lean();
}

async function findUpcoming(
  fromDate: Date = new Date(),
  limit: number = 10,
  isActive: boolean = true,
): Promise<Holiday[]> {
  return await HolidayModel.find({
    date: { $gte: fromDate },
    isActive,
  })
    .sort({ date: 1 })
    .limit(limit)
    .lean();
}

async function update(
  id: Types.ObjectId,
  holiday: Partial<Holiday>,
): Promise<Holiday | null> {
  return await HolidayModel.findByIdAndUpdate(
    id,
    {
      ...holiday,
      updatedAt: new Date(),
    },
    { new: true },
  ).lean();
}

async function deleteHoliday(id: Types.ObjectId): Promise<boolean> {
  const result = await HolidayModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
      updatedAt: new Date(),
    },
    { new: true },
  );
  return !!result;
}

async function hardDelete(id: Types.ObjectId): Promise<boolean> {
  const result = await HolidayModel.findByIdAndDelete(id);
  return !!result;
}

async function isHoliday(date: Date): Promise<{
  isHoliday: boolean;
  holiday?: Holiday;
  operationalStatus?: OperationalStatus;
}> {
  const holiday = await findByDate(date);

  return {
    isHoliday: !!holiday,
    holiday: holiday || undefined,
    operationalStatus: holiday?.operationalStatus,
  };
}

async function getHolidaysInMonth(
  year: number,
  month: number, // 0-11 (JavaScript month format)
  isActive: boolean = true,
): Promise<Holiday[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return await findByDateRange(startDate, endDate, isActive);
}

async function getHolidaysInYear(
  year: number,
  isActive: boolean = true,
): Promise<Holiday[]> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  return await findByDateRange(startDate, endDate, isActive);
}

export default {
  create,
  findById,
  findAll,
  findByDateRange,
  findByDate,
  findByType,
  findUpcoming,
  update,
  delete: deleteHoliday,
  hardDelete,
  isHoliday,
  getHolidaysInMonth,
  getHolidaysInYear,
};
