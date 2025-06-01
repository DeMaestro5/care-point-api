import { Types } from 'mongoose';
import { AppointmentModel } from '../model/Appointment';
import type Appointment from '../model/Appointment';
import { DoctorModel } from '../model/Doctor';

type PopulatedAppointment = any; // TODO: Create proper type for populated appointment

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<PopulatedAppointment[]> {
  return (
    AppointmentModel.find({ patient: patientId })
      .populate({
        path: 'doctor',
        select: 'name specialization user hospital',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      // .populate({
      //   path: 'patient',
      //   select: 'name user dateOfBirth gender',
      //   populate: {
      //     path: 'user',
      //     select: 'name email',
      //   },
      // })
      .sort({ appointmentDate: -1 })
      .lean()
      .exec()
  );
}

async function findById(
  id: Types.ObjectId,
): Promise<PopulatedAppointment | null> {
  console.log('Repository: Finding appointment by ID:', id.toString());
  const appointment = await AppointmentModel.findById(id)
    .populate({
      path: 'doctor',
      select: '_id name specialization user hospital',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .populate({
      path: 'patient',
      select: '_id name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .lean()
    .exec();

  console.log('Repository: Found appointment:', appointment);
  return appointment;
}

async function create(
  appointment: Partial<Appointment>,
): Promise<PopulatedAppointment> {
  try {
    // Ensure patient and doctor are ObjectIds
    const appointmentData = {
      ...appointment,
      patient: new Types.ObjectId(appointment.patient as any),
      doctor: new Types.ObjectId(appointment.doctor as any),
      appointmentDate: new Date(appointment.appointmentDate as Date),
    };

    const createdAppointment = await AppointmentModel.create(appointmentData);

    // Fetch the populated appointment with patient and doctor data
    const populatedAppointment = await AppointmentModel.findById(
      createdAppointment._id,
    )
      .populate({
        path: 'doctor',
        select: '_id name specialization user hospital',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .populate({
        path: 'patient',
        select: '_id name user dateOfBirth gender',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .lean()
      .exec();

    if (!populatedAppointment) {
      throw new Error('Failed to create appointment');
    }

    return populatedAppointment;
  } catch (error) {
    console.error('Repository: Error creating appointment:', error);
    throw error;
  }
}

async function update(
  id: Types.ObjectId,
  update: Partial<Appointment>,
): Promise<PopulatedAppointment | null> {
  try {
    // First, get the existing appointment to check if it exists
    const existingAppointment = await AppointmentModel.findById(id);

    if (!existingAppointment) {
      console.log('Repository: No existing appointment found');
      return null;
    }

    // Prepare the update with required fields
    const safeUpdate: any = { ...update };

    // Ensure we have valid ObjectIds for patient and doctor
    if (safeUpdate.patient) {
      safeUpdate.patient = new Types.ObjectId(safeUpdate.patient);
    }
    if (safeUpdate.doctor) {
      safeUpdate.doctor = new Types.ObjectId(safeUpdate.doctor);
    }

    // Don't allow updates to timestamps via this method
    delete safeUpdate.createdAt;

    // Always set the updatedAt timestamp
    safeUpdate.updatedAt = new Date();

    // Ensure date fields are properly converted
    if (safeUpdate.appointmentDate) {
      safeUpdate.appointmentDate = new Date(safeUpdate.appointmentDate);
    }

    // Update the appointment
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: safeUpdate },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate({
        path: 'doctor',
        select: '_id name specialization user hospital',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .populate({
        path: 'patient',
        select: '_id name user dateOfBirth gender',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .lean()
      .exec();

    if (!updatedAppointment) {
      return null;
    }

    // Convert to plain object to match the expected type
    return updatedAppointment;
  } catch (error) {
    console.error('Repository: Error updating appointment:', error);
    throw error;
  }
}

async function deleteById(
  id: Types.ObjectId,
): Promise<PopulatedAppointment | null> {
  console.log('Repository: Deleting appointment:', id.toString());
  const deletedAppointment = await AppointmentModel.findOneAndDelete({
    _id: id,
  })
    .populate({
      path: 'doctor',
      select: '_id name specialization user hospital',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .populate({
      path: 'patient',
      select: '_id name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .lean()
    .exec();

  console.log('Repository: Deleted appointment:', deletedAppointment);
  return deletedAppointment;
}

async function findUpcomingByPatientId(
  patientId: Types.ObjectId,
): Promise<PopulatedAppointment[]> {
  return AppointmentModel.find({
    patient: patientId,
    appointmentDate: { $gte: new Date() },
    status: { $nin: ['cancelled', 'completed'] },
  })
    .populate({
      path: 'doctor',
      select: '_id name specialization user hospital',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .populate({
      path: 'patient',
      select: '_id name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .sort({ appointmentDate: 1 })
    .lean()
    .exec();
}

async function findByDoctorId(
  doctorId: Types.ObjectId,
): Promise<PopulatedAppointment[]> {
  return AppointmentModel.find({ doctor: doctorId })
    .populate({
      path: 'doctor',
      select: '_id name specialization user hospital',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .populate({
      path: 'patient',
      select: '_id name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    })
    .sort({ appointmentDate: -1 })
    .lean()
    .exec();
}

async function findByFilter(
  filter: any,
  options: { page: number; limit: number },
): Promise<{ appointments: PopulatedAppointment[]; total: number }> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  console.log('Repository: Finding appointments with filter:', filter);

  const [appointments, total] = await Promise.all([
    AppointmentModel.find(filter)
      .populate({
        path: 'doctor',
        select: '_id name specialization user hospital',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .populate({
        path: 'patient',
        select: '_id name user dateOfBirth gender',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      })
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    AppointmentModel.countDocuments(filter),
  ]);

  console.log('Repository: Found appointments:', appointments);
  return { appointments, total };
}

async function getAvailability(
  doctorId: Types.ObjectId,
  startDate: Date,
  endDate: Date,
): Promise<{ date: Date; availableSlots: string[] }[]> {
  // First get all booked appointments for the doctor in the date range
  const bookedAppointments = await AppointmentModel.find({
    doctor: doctorId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'rescheduled'] },
  }).lean();

  // Get doctor's working hours from DoctorRepo
  const doctor = await DoctorModel.findById(doctorId)
    .select('availability')
    .lean();

  if (!doctor || !doctor.availability) {
    return [];
  }

  const availableSlots: { date: Date; availableSlots: string[] }[] = [];
  const currentDate = new Date(startDate);
  const endDateTime = new Date(endDate);

  // Map of day number to day name
  const dayMap: { [key: number]: keyof typeof doctor.availability } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  // For each day in the range
  while (currentDate <= endDateTime) {
    const dayOfWeek = currentDate.getDay();
    const dayName = dayMap[dayOfWeek];
    const dayAvailability = doctor.availability[dayName];

    if (dayAvailability && dayAvailability.length > 0) {
      // Filter out slots that are already booked
      const availableDaySlots = dayAvailability.filter((slot) => {
        const slotDateTime = new Date(
          `${currentDate.toISOString().split('T')[0]}T${slot}`,
        );
        return !bookedAppointments.some(
          (appt) =>
            appt.appointmentDate.toISOString() === slotDateTime.toISOString(),
        );
      });

      if (availableDaySlots.length > 0) {
        availableSlots.push({
          date: new Date(currentDate),
          availableSlots: availableDaySlots,
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableSlots;
}

async function count(filters: any = {}): Promise<number> {
  return AppointmentModel.countDocuments(filters).exec();
}

export default {
  findByPatientId,
  findById,
  create,
  update,
  delete: deleteById,
  findUpcomingByPatientId,
  findByDoctorId,
  findByFilter,
  getAvailability,
  count,
};
