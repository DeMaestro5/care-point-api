import Joi from 'joi';
import { JoiAuthBearer } from '../../helpers/validator';
import { RoleCode } from '../../database/model/Role';

const patientFields = Joi.object().keys({
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .required(),
  height: Joi.number().required(),
  weight: Joi.number().required(),
  allergies: Joi.array().items(Joi.string()).optional(),
  medicalHistory: Joi.array().items(Joi.string()).optional(),
});

const doctorFields = Joi.object().keys({
  specialization: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  yearsOfExperience: Joi.number().required(),
  education: Joi.array().items(Joi.string()).required(),
  certifications: Joi.array().items(Joi.string()).optional(),
});

const ambulanceFields = Joi.object().keys({
  vehicleNumber: Joi.string().required(),
  vehicleType: Joi.string().required(),
  equipment: Joi.array().items(Joi.string()).required(),
  crewMembers: Joi.number().required(),
});

const pharmacyFields = Joi.object().keys({
  licenseNumber: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  workingHours: Joi.string().required(),
});

export default {
  credential: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
  signup: Joi.object()
    .keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      profilePicUrl: Joi.string().required().uri(),
      role: Joi.string()
        .valid(...Object.values(RoleCode))
        .required(),

      // Include all possible fields but make them optional at the schema level
      // They will be required based on role via the .when() conditions
      dateOfBirth: Joi.date().optional(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
      bloodGroup: Joi.string()
        .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
        .optional(),
      height: Joi.number().optional(),
      weight: Joi.number().optional(),
      allergies: Joi.array().items(Joi.string()).optional(),
      medicalHistory: Joi.array().items(Joi.string()).optional(),

      specialization: Joi.string().optional(),
      licenseNumber: Joi.string().optional(),
      yearsOfExperience: Joi.number().optional(),
      education: Joi.array().items(Joi.string()).optional(),
      certifications: Joi.array().items(Joi.string()).optional(),

      vehicleNumber: Joi.string().optional(),
      vehicleType: Joi.string().optional(),
      equipment: Joi.array().items(Joi.string()).optional(),
      crewMembers: Joi.number().optional(),

      address: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
      workingHours: Joi.string().optional(),
    })
    .when('.role', {
      is: RoleCode.PATIENT,
      then: Joi.object({
        dateOfBirth: Joi.date().required(),
        gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
        bloodGroup: Joi.string()
          .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
          .required(),
        height: Joi.number().required(),
        weight: Joi.number().required(),
      }),
    })
    .when('.role', {
      is: RoleCode.DOCTOR,
      then: Joi.object({
        specialization: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        yearsOfExperience: Joi.number().required(),
        education: Joi.array().items(Joi.string()).required(),
      }),
    })
    .when('.role', {
      is: RoleCode.AMBULANCE,
      then: Joi.object({
        vehicleNumber: Joi.string().required(),
        vehicleType: Joi.string().required(),
        equipment: Joi.array().items(Joi.string()).required(),
        crewMembers: Joi.number().required(),
      }),
    })
    .when('.role', {
      is: RoleCode.PHARMACY,
      then: Joi.object({
        licenseNumber: Joi.string().required(),
        address: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        workingHours: Joi.string().required(),
      }),
    }),
  forgotPassword: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
  resetPassword: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().min(8),
  }),
};
