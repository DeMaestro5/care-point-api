import { Types } from 'mongoose';
import { CalendarEventModel } from '../model/CalendarEvent';
import type CalendarEvent from '../model/CalendarEvent';

type PopulatedCalendarEvent = any; // TODO: Create proper type for populated calendar event

async function create(
  eventData: Partial<CalendarEvent>,
): Promise<PopulatedCalendarEvent> {
  const createdEvent = await CalendarEventModel.create({
    ...eventData,
    organizer: new Types.ObjectId(eventData.organizer as any),
    attendees: (eventData.attendees || []).map(
      (id: any) => new Types.ObjectId(id),
    ),
    startDate: new Date(eventData.startDate as Date),
    endDate: new Date(eventData.endDate as Date),
  });

  return await findById(createdEvent._id);
}

async function findById(
  id: Types.ObjectId,
): Promise<PopulatedCalendarEvent | null> {
  return await CalendarEventModel.findById(id)
    .populate({
      path: 'organizer',
      select: 'name email',
    })
    .populate({
      path: 'attendees',
      select: 'name email',
    })
    .populate({
      path: 'metadata.appointmentId',
      select: 'reason status appointmentDate',
    })
    .populate({
      path: 'metadata.patientId',
      select: 'name user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'metadata.doctorId',
      select: 'name specialization user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .lean()
    .exec();
}

async function update(
  id: Types.ObjectId,
  updateData: Partial<CalendarEvent>,
): Promise<PopulatedCalendarEvent | null> {
  const safeUpdate: any = { ...updateData };

  if (safeUpdate.organizer) {
    safeUpdate.organizer = new Types.ObjectId(safeUpdate.organizer);
  }

  if (safeUpdate.attendees) {
    safeUpdate.attendees = safeUpdate.attendees.map(
      (id: any) => new Types.ObjectId(id),
    );
  }

  if (safeUpdate.startDate) {
    safeUpdate.startDate = new Date(safeUpdate.startDate);
  }

  if (safeUpdate.endDate) {
    safeUpdate.endDate = new Date(safeUpdate.endDate);
  }

  // Remove timestamp fields to let mongoose handle them
  delete safeUpdate.createdAt;
  safeUpdate.updatedAt = new Date();

  await CalendarEventModel.findByIdAndUpdate(
    id,
    { $set: safeUpdate },
    { new: true, runValidators: true },
  );

  return await findById(id);
}

async function deleteById(
  id: Types.ObjectId,
): Promise<PopulatedCalendarEvent | null> {
  const event = await findById(id);
  if (event) {
    await CalendarEventModel.findByIdAndDelete(id);
  }
  return event;
}

async function findByUserId(
  userId: Types.ObjectId,
  startDate?: Date,
  endDate?: Date,
): Promise<PopulatedCalendarEvent[]> {
  const filter: any = {
    $or: [{ organizer: userId }, { attendees: userId }],
  };

  if (startDate || endDate) {
    filter.$and = filter.$and || [];
    const dateFilter: any = {};

    if (startDate) {
      dateFilter.$gte = startDate;
    }

    if (endDate) {
      dateFilter.$lte = endDate;
    }

    filter.$and.push({
      $or: [
        { startDate: dateFilter },
        { endDate: dateFilter },
        {
          $and: [
            { startDate: { $lte: startDate || new Date() } },
            { endDate: { $gte: endDate || new Date() } },
          ],
        },
      ],
    });
  }

  return await CalendarEventModel.find(filter)
    .populate({
      path: 'organizer',
      select: 'name email',
    })
    .populate({
      path: 'attendees',
      select: 'name email',
    })
    .populate({
      path: 'metadata.appointmentId',
      select: 'reason status appointmentDate',
    })
    .populate({
      path: 'metadata.patientId',
      select: 'name user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'metadata.doctorId',
      select: 'name specialization user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .sort({ startDate: 1 })
    .lean()
    .exec();
}

async function findByFilter(
  filter: any,
  options: { page?: number; limit?: number; sort?: any } = {},
): Promise<{ events: PopulatedCalendarEvent[]; total: number }> {
  const { page = 1, limit = 10, sort = { startDate: 1 } } = options;

  const query = CalendarEventModel.find(filter)
    .populate({
      path: 'organizer',
      select: 'name email',
    })
    .populate({
      path: 'attendees',
      select: 'name email',
    })
    .populate({
      path: 'metadata.appointmentId',
      select: 'reason status appointmentDate',
    })
    .populate({
      path: 'metadata.patientId',
      select: 'name user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'metadata.doctorId',
      select: 'name specialization user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .sort(sort)
    .lean();

  const [events, total] = await Promise.all([
    query
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    CalendarEventModel.countDocuments(filter),
  ]);

  return { events, total };
}

async function checkAvailability(
  userIds: Types.ObjectId[],
  startDate: Date,
  endDate: Date,
): Promise<
  {
    userId: Types.ObjectId;
    isAvailable: boolean;
    conflictingEvents: PopulatedCalendarEvent[];
  }[]
> {
  const results = await Promise.all(
    userIds.map(async (userId) => {
      const conflictingEvents = await CalendarEventModel.find({
        $and: [
          {
            $or: [{ organizer: userId }, { attendees: userId }],
          },
          { status: 'scheduled' },
          {
            $or: [
              {
                $and: [
                  { startDate: { $lte: startDate } },
                  { endDate: { $gte: startDate } },
                ],
              },
              {
                $and: [
                  { startDate: { $lte: endDate } },
                  { endDate: { $gte: endDate } },
                ],
              },
              {
                $and: [
                  { startDate: { $gte: startDate } },
                  { endDate: { $lte: endDate } },
                ],
              },
            ],
          },
        ],
      })
        .populate({
          path: 'organizer',
          select: 'name email',
        })
        .populate({
          path: 'attendees',
          select: 'name email',
        })
        .lean()
        .exec();

      return {
        userId,
        isAvailable: conflictingEvents.length === 0,
        conflictingEvents,
      };
    }),
  );

  return results;
}

async function findUpcomingByUserId(
  userId: Types.ObjectId,
  limit: number = 10,
): Promise<PopulatedCalendarEvent[]> {
  const now = new Date();

  return await CalendarEventModel.find({
    $or: [{ organizer: userId }, { attendees: userId }],
    startDate: { $gte: now },
    status: 'scheduled',
  })
    .populate({
      path: 'organizer',
      select: 'name email',
    })
    .populate({
      path: 'attendees',
      select: 'name email',
    })
    .populate({
      path: 'metadata.appointmentId',
      select: 'reason status appointmentDate',
    })
    .populate({
      path: 'metadata.patientId',
      select: 'name user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'metadata.doctorId',
      select: 'name specialization user',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .sort({ startDate: 1 })
    .limit(limit)
    .lean()
    .exec();
}

export default {
  create,
  findById,
  update,
  deleteById,
  findByUserId,
  findByFilter,
  checkAvailability,
  findUpcomingByUserId,
};
