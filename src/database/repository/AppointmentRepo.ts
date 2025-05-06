import { Types } from 'mongoose';
import { AppointmentModel } from '../model/Appointment';
import type Appointment from '../model/Appointment';

type PopulatedAppointment = any; // TODO: Create proper type for populated appointment

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<PopulatedAppointment[]> {
  return AppointmentModel.find({ patient: patientId })
    .populate({
      path: 'doctor',
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .sort({ appointmentDate: -1 })
    .lean()
    .exec();
}

async function findById(
  id: Types.ObjectId,
): Promise<PopulatedAppointment | null> {
  console.log('Repository: Finding appointment by ID:', id.toString());
  const appointment = await AppointmentModel.findById(id)
    .populate({
      path: 'doctor',
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email',
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
    console.log('Repository: Creating appointment with data:', appointment);

    // Ensure patient and doctor are ObjectIds
    const appointmentData = {
      ...appointment,
      patient: new Types.ObjectId(appointment.patient as any),
      doctor: new Types.ObjectId(appointment.doctor as any),
      appointmentDate: new Date(appointment.appointmentDate as Date),
    };

    console.log('Repository: Processed appointment data:', appointmentData);

    const createdAppointment = await AppointmentModel.create(appointmentData);
    console.log('Repository: Created appointment:', createdAppointment);

    // Fetch the populated appointment
    const populatedAppointment = await findById(createdAppointment._id);
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
    console.log('Repository: Updating appointment:', {
      id: id.toString(),
      updateData: update,
    });

    // First, get the existing appointment to check if it exists
    const existingAppointment = await AppointmentModel.findById(id);
    console.log('Repository: Found existing appointment:', existingAppointment);

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

    console.log('Repository: Applying update with data:', safeUpdate);

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
        select: 'name specialization user hospital',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate({
        path: 'patient',
        select: 'name user dateOfBirth gender',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .exec();

    if (!updatedAppointment) {
      console.log('Repository: Failed to update appointment');
      return null;
    }

    // Convert to plain object to match the expected type
    const plainAppointment = updatedAppointment.toObject();
    console.log('Repository: Updated appointment result:', plainAppointment);
    return plainAppointment;
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
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email',
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
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email',
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
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .populate({
      path: 'doctor',
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email',
      },
    })
    .sort({ appointmentDate: -1 })
    .lean()
    .exec();
}

export default {
  findByPatientId,
  findById,
  create,
  update,
  delete: deleteById,
  findUpcomingByPatientId,
  findByDoctorId,
};
