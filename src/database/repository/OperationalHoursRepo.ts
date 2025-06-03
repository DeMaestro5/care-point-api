import OperationalHours, {
  OperationalHoursModel,
  DaySchedule,
} from '../model/OperationalHours';

async function create(
  operationalHours: Partial<OperationalHours>,
): Promise<OperationalHours> {
  const now = new Date();
  const hoursDoc = new OperationalHoursModel({
    ...operationalHours,
    createdAt: now,
    updatedAt: now,
  });
  return await hoursDoc.save();
}

async function get(): Promise<OperationalHours | null> {
  return await OperationalHoursModel.findOne().lean();
}

async function update(
  operationalHours: Partial<OperationalHours>,
): Promise<OperationalHours | null> {
  return await OperationalHoursModel.findOneAndUpdate(
    {},
    {
      ...operationalHours,
      updatedAt: new Date(),
    },
    { new: true, upsert: true },
  ).lean();
}

async function getOrCreate(
  defaultHours?: Partial<OperationalHours>,
): Promise<OperationalHours> {
  let hours = await this.get();

  if (!hours) {
    const defaultSchedule: DaySchedule = {
      isOpen: false,
      slots: [],
    };

    hours = await this.create({
      monday: defaultSchedule,
      tuesday: defaultSchedule,
      wednesday: defaultSchedule,
      thursday: defaultSchedule,
      friday: defaultSchedule,
      saturday: defaultSchedule,
      sunday: defaultSchedule,
      timezone: 'UTC',
      ...defaultHours,
    });
  }

  return hours;
}

async function getDaySchedule(day: string): Promise<DaySchedule | null> {
  const hours = await this.get();
  if (!hours) return null;

  const validDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  if (!validDays.includes(day.toLowerCase())) return null;

  return hours[day.toLowerCase() as keyof OperationalHours] as DaySchedule;
}

async function updateDaySchedule(
  day: string,
  schedule: DaySchedule,
): Promise<OperationalHours | null> {
  const validDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  if (!validDays.includes(day.toLowerCase())) return null;

  const updateData = {
    [day.toLowerCase()]: schedule,
    updatedAt: new Date(),
  };

  return await OperationalHoursModel.findOneAndUpdate({}, updateData, {
    new: true,
    upsert: true,
  }).lean();
}

async function isOpenOnDay(day: string): Promise<boolean> {
  const schedule = await this.getDaySchedule(day);
  return schedule?.isOpen ?? false;
}

async function getTimezone(): Promise<string> {
  const hours = await this.get();
  return hours?.timezone ?? 'UTC';
}

export default {
  create,
  get,
  update,
  getOrCreate,
  getDaySchedule,
  updateDaySchedule,
  isOpenOnDay,
  getTimezone,
};
