import express from 'express';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import { ForbiddenError } from '../../core/ApiError';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { Types } from 'mongoose';
import doctorAuth from '../../auth/doctorAuth';
import validator from '../../helpers/validator';
import schema from './schema';
import type Appointment from '../../database/model/Appointment';
import { AppointmentModel } from '../../database/model/Appointment';

const router = express.Router({ mergeParams: true });

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/

// Get all appointments for a patient
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);

    // Only allow patients to view their own appointments or doctors to view any patient's appointments
    if (
      req.user.role !== 'DOCTOR' &&
      req.user._id.toString() !== patientId.toString()
    ) {
      throw new ForbiddenError('You can only access your own appointments');
    }

    const appointments = await AppointmentRepo.findByPatientId(patientId);

    if (!appointments.length) {
      return new NotFoundResponse('No appointments found').send(res);
    }

    return new SuccessResponse('Appointments retrieved successfully', {
      appointments,
    }).send(res);
  }),
);

// Create a new appointment (doctors only)
router.post(
  '/',
  doctorAuth, // Doctor auth first
  validator(schema.appointment),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const patientId = new Types.ObjectId(req.params.patientId);
      const doctorId = new Types.ObjectId(req.user._id);

      const appointmentData = {
        ...req.body,
        patient: patientId,
        doctor: doctorId,
        status: 'scheduled', // Default status for new appointments
      };

      const appointment = await AppointmentRepo.create(appointmentData);

      return new SuccessResponse('Appointment created successfully', {
        appointment: {
          ...appointment,
          patient: {
            _id: patientId,
            ...(appointment.patient || {}),
          },
          doctor: {
            _id: doctorId,
            ...(appointment.doctor || {}),
          },
        },
      }).send(res);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }),
);

// Update an appointment (doctors only)
router.put(
  '/:appointmentId',
  doctorAuth, // Doctor auth first
  validator(schema.updateAppointment),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const appointmentId = new Types.ObjectId(req.params.appointmentId);
      const doctorId = new Types.ObjectId(req.user._id);
      const patientId = new Types.ObjectId(req.params.patientId);

      // First fetch the existing appointment
      const existingAppointment = await AppointmentRepo.findById(appointmentId);

      if (!existingAppointment) {
        throw new NotFoundResponse('Appointment not found');
      }

      // Check if the appointment has valid references
      if (!existingAppointment.patient && !existingAppointment.doctor) {
        // This is a recovery path for appointments with missing references
        // Attempt to update the appointment with the current patientId and doctorId
        const fixedAppointment = await AppointmentModel.findByIdAndUpdate(
          appointmentId,
          {
            $set: {
              patient: patientId,
              doctor: doctorId,
            },
          },
          { new: true },
        ).exec();

        if (fixedAppointment) {
          // Re-fetch the fully populated appointment
          const refreshedAppointment =
            await AppointmentRepo.findById(appointmentId);
          if (refreshedAppointment) {
            existingAppointment.patient = refreshedAppointment.patient;
            existingAppointment.doctor = refreshedAppointment.doctor;
          }
        }
      }

      // Get the patient ID from the appointment (handle both populated and non-populated cases)
      let appointmentPatientId = null;
      if (existingAppointment.patient) {
        appointmentPatientId =
          typeof existingAppointment.patient === 'object' &&
          existingAppointment.patient._id
            ? existingAppointment.patient._id
            : existingAppointment.patient;
      }

      // If references are still missing, we use the IDs from the request
      if (!appointmentPatientId) {
        appointmentPatientId = patientId;
      }

      // Get the doctor ID from the appointment (handle both populated and non-populated cases)
      let appointmentDoctorId = null;
      if (existingAppointment.doctor) {
        appointmentDoctorId =
          typeof existingAppointment.doctor === 'object' &&
          existingAppointment.doctor._id
            ? existingAppointment.doctor._id
            : existingAppointment.doctor;
      }

      // If doctor reference is still missing, use the current doctor
      if (!appointmentDoctorId) {
        appointmentDoctorId = doctorId;
      }

      // Handle the update data
      const updateData: Partial<Appointment> = {
        // Ensure we always have valid references
        patient: appointmentPatientId,
        doctor: appointmentDoctorId,
      };

      // Only update fields that are provided
      if (req.body.appointmentDate) {
        updateData.appointmentDate = new Date(req.body.appointmentDate);
      }
      if (req.body.status) {
        updateData.status = req.body.status;
      }
      if (req.body.reason) {
        updateData.reason = req.body.reason;
      }
      if (req.body.notes !== undefined) {
        updateData.notes = req.body.notes;
      }

      const updatedAppointment = await AppointmentRepo.update(
        appointmentId,
        updateData,
      );

      if (!updatedAppointment) {
        throw new NotFoundResponse('Failed to update appointment');
      }
      // Ensure we have the correct references in the response
      const response = {
        appointment: {
          ...updatedAppointment,
          patient: updatedAppointment.patient || { _id: patientId },
          doctor: updatedAppointment.doctor || { _id: doctorId },
        },
      };

      return new SuccessResponse(
        'Appointment updated successfully',
        response,
      ).send(res);
    } catch (error) {
      console.error('Error in appointment update:', error);
      throw error;
    }
  }),
);

// Delete an appointment (doctors only)
router.delete(
  '/:appointmentId',
  doctorAuth, // Doctor auth first
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const appointmentId = new Types.ObjectId(req.params.appointmentId);
      const doctorId = new Types.ObjectId(req.user._id);
      const patientId = new Types.ObjectId(req.params.patientId);

      // First fetch the appointment to check permissions
      const existingAppointment = await AppointmentRepo.findById(appointmentId);

      if (!existingAppointment) {
        throw new NotFoundResponse('Appointment not found');
      }

      // Check if the appointment has valid references
      if (!existingAppointment.patient && !existingAppointment.doctor) {
        // This is a recovery path for appointments with missing references
        const fixedAppointment = await AppointmentModel.findByIdAndUpdate(
          appointmentId,
          {
            $set: {
              patient: patientId,
              doctor: doctorId,
            },
          },
          { new: true },
        ).exec();

        if (fixedAppointment) {
          // Re-fetch the fully populated appointment
          const refreshedAppointment =
            await AppointmentRepo.findById(appointmentId);
          if (refreshedAppointment) {
            existingAppointment.patient = refreshedAppointment.patient;
            existingAppointment.doctor = refreshedAppointment.doctor;
          }
        }
      }

      // Get the patient ID from the appointment (handle both populated and non-populated cases)
      let appointmentPatientId = null;
      if (existingAppointment.patient) {
        appointmentPatientId =
          typeof existingAppointment.patient === 'object' &&
          existingAppointment.patient._id
            ? existingAppointment.patient._id
            : existingAppointment.patient;
      }

      // If references are still missing, use the ID from the request
      if (!appointmentPatientId) {
        appointmentPatientId = patientId;
      }

      // Get the doctor ID from the appointment (handle both populated and non-populated cases)
      let appointmentDoctorId = null;
      if (existingAppointment.doctor) {
        appointmentDoctorId =
          typeof existingAppointment.doctor === 'object' &&
          existingAppointment.doctor._id
            ? existingAppointment.doctor._id
            : existingAppointment.doctor;
      }

      // If doctor reference is still missing, use the current doctor
      if (!appointmentDoctorId) {
        appointmentDoctorId = doctorId;
      }

      const deletedAppointment = await AppointmentRepo.delete(appointmentId);
      if (!deletedAppointment) {
        throw new NotFoundResponse('Failed to delete appointment');
      }

      // Ensure we have the correct references in the response
      const response = {
        appointment: {
          ...deletedAppointment,
          patient: deletedAppointment.patient || { _id: appointmentPatientId },
          doctor: deletedAppointment.doctor || { _id: appointmentDoctorId },
        },
      };

      return new SuccessResponse(
        'Appointment deleted successfully',
        response,
      ).send(res);
    } catch (error) {
      console.error('Error in appointment deletion:', error);
      throw error;
    }
  }),
);

export default router;
