import Joi from 'joi';
import { JoiAuthBearer } from '../../helpers/validator';
import { RoleCode } from '../../database/model/Role';

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
  adminSignup: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    profilePicUrl: Joi.string().required().uri(),
  }),
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
      emergencyContact: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        relationship: Joi.string().required(),
      }).optional(),
      medicalHistory: Joi.array().items(Joi.string()).optional(),

      specialization: Joi.string().optional(),
      qualification: Joi.string().optional(),
      licenseNumber: Joi.string().optional(),
      consultationFee: Joi.number().optional(),
      yearsOfExperience: Joi.number().optional(),
      education: Joi.array().items(Joi.string()).optional(),
      certifications: Joi.array().items(Joi.string()).optional(),
      availability: Joi.object({
        monday: Joi.array().items(Joi.string()).optional(),
        tuesday: Joi.array().items(Joi.string()).optional(),
        wednesday: Joi.array().items(Joi.string()).optional(),
        thursday: Joi.array().items(Joi.string()).optional(),
        friday: Joi.array().items(Joi.string()).optional(),
        saturday: Joi.array().items(Joi.string()).optional(),
        sunday: Joi.array().items(Joi.string()).optional(),
      }).optional(),
      hospital: Joi.string().optional(),

      vehicleNumbers: Joi.array().items(Joi.string()).optional(),
      vehicleCount: Joi.number().optional(),
      vehicleTypes: Joi.array().items(Joi.string()).optional(),
      equipments: Joi.array().items(Joi.string()).optional(),
      crewMembers: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            role: Joi.string().required(),
            experience: Joi.string().required(),
          }),
        )
        .optional(),
      serviceArea: Joi.array().items(Joi.string()).optional(),
      contactNumber: Joi.string().optional(),
      operatingHours: Joi.array().items(Joi.string()).optional(),
      baseLocation: Joi.object({
        address: Joi.string().optional(),
        coordinates: Joi.object({
          latitude: Joi.number().optional(),
          longitude: Joi.number().optional(),
        }).optional(),
      }).optional(),

      address: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
      workingHours: Joi.string().optional(),
      services: Joi.array().items(Joi.string()).optional(),
      hasInsuranceSupport: Joi.boolean().optional(),
      acceptedInsuranceProviders: Joi.array().items(Joi.string()).optional(),
      coordinates: Joi.object({
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
      }).optional(),
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
        emergencyContact: Joi.object({
          name: Joi.string().required(),
          phone: Joi.string().required(),
          relationship: Joi.string().required(),
        }).optional(),
      }),
    })
    .when('.role', {
      is: RoleCode.DOCTOR,
      then: Joi.object({
        specialization: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        consultationFee: Joi.number().required(),
        yearsOfExperience: Joi.number().required(),
        education: Joi.array().items(Joi.string()).required(),
        hospital: Joi.string().required(),
        availability: Joi.object({
          monday: Joi.array().items(Joi.string()).required(),
          tuesday: Joi.array().items(Joi.string()).required(),
          wednesday: Joi.array().items(Joi.string()).required(),
          thursday: Joi.array().items(Joi.string()).required(),
          friday: Joi.array().items(Joi.string()).required(),
        }).required(),
      }),
    })
    .when('.role', {
      is: RoleCode.AMBULANCE,
      then: Joi.object({
        vehicleNumbers: Joi.array().items(Joi.string()).required(),
        vehicleTypes: Joi.array().items(Joi.string()).required(),
        vehicleCount: Joi.number().required(),
        equipments: Joi.array().items(Joi.string()).required(),
        crewMembers: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              role: Joi.string().required(),
              experience: Joi.string().required(),
            }),
          )
          .required(),
        serviceArea: Joi.array().items(Joi.string()).required(),
        contactNumber: Joi.string().required(),
        operatingHours: Joi.array().items(Joi.string()).required(),
        baseLocation: Joi.object({
          address: Joi.string().required(),
          coordinates: Joi.object({
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
          }).required(),
        }).required(),
      }),
    })
    .when('.role', {
      is: RoleCode.PHARMACY,
      then: Joi.object({
        licenseNumber: Joi.string().required(),
        address: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        workingHours: Joi.string().required(),
        services: Joi.array().items(Joi.string()).required(),
        hasInsuranceSupport: Joi.boolean().required(),
        acceptedInsuranceProviders: Joi.array().items(Joi.string()).required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
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
