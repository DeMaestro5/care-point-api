import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from '../../types/app-request.d';
import crypto from 'crypto';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import User from '../../database/model/User';
import { createTokens } from '../../auth/authUtils';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import bcrypt from 'bcrypt';
import { RoleCode } from '../../database/model/Role';
import { getUserData } from './utils';
import PatientRepo from '../../database/repository/PatientRepo';
import Patient from '../../database/model/Patient';
import DoctorRepo from '../../database/repository/DoctorRepo';
import Doctor from '../../database/model/Doctor';
import AmbulanceRepo from '../../database/repository/AmbulanceRepo';
import Ambulance from '../../database/model/Ambulance';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import Pharmacy from '../../database/model/Pharmacy';

const router = express.Router();

// Admin signup endpoint
router.post(
  '/admin',
  validator(schema.adminSignup),
  asyncHandler(async (req: RoleRequest, res) => {
    const user = await UserRepo.findByEmail(req.body.email);
    if (user) throw new BadRequestError('User already registered');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const { user: createdUser, keystore } = await UserRepo.create(
      {
        name: req.body.name,
        email: req.body.email,
        profilePicUrl: req.body.profilePicUrl,
        password: passwordHash,
      } as User,
      accessTokenKey,
      refreshTokenKey,
      RoleCode.ADMIN,
    );

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey,
    );
    const userData = await getUserData(createdUser);

    new SuccessResponse('Admin Signup Successful', {
      user: {
        ...userData,
        role: createdUser.role,
      },
      tokens: tokens,
    }).send(res);
  }),
);

router.post(
  '/basic',
  validator(schema.signup),
  asyncHandler(async (req: RoleRequest, res) => {
    const user = await UserRepo.findByEmail(req.body.email);
    if (user) throw new BadRequestError('User already registered');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const { user: createdUser, keystore } = await UserRepo.create(
      {
        name: req.body.name,
        email: req.body.email,
        profilePicUrl: req.body.profilePicUrl,
        password: passwordHash,
      } as User,
      accessTokenKey,
      refreshTokenKey,
      req.body.role as RoleCode,
    );

    // Create role-specific profile based on the role
    switch (req.body.role) {
      case RoleCode.PATIENT:
        await PatientRepo.create({
          user: createdUser._id,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          bloodGroup: req.body.bloodGroup,
          height: req.body.height,
          weight: req.body.weight,
          allergies: req.body.allergies,
          emergencyContact: req.body.emergencyContact,
          medicalHistory: req.body.medicalHistory,
        } as Patient);
        break;
      case RoleCode.DOCTOR:
        await DoctorRepo.create({
          user: createdUser._id,
          specialization: req.body.specialization,
          licenseNumber: req.body.licenseNumber,
          consultationFee: req.body.consultationFee,
          yearsOfExperience: req.body.yearsOfExperience,
          qualification: req.body.qualification,
          education: req.body.education,
          certifications: req.body.certifications,
          availability: req.body.availability,
          hospital: req.body.hospital,
        } as Doctor);
        break;
      case RoleCode.AMBULANCE:
        await AmbulanceRepo.create({
          user: createdUser._id,
          vehicleNumbers: req.body.vehicleNumbers,
          vehicleTypes: req.body.vehicleTypes,
          equipments: req.body.equipments,
          serviceArea: req.body.serviceArea,
          vehicleCount: req.body.vehicleCount,
          contactNumber: req.body.contactNumber,
          operatingHours: req.body.operatingHours,
          baseLocation: req.body.baseLocation,
          crewMembers: req.body.crewMembers,
        } as Ambulance);
        break;
      case RoleCode.PHARMACY:
        await PharmacyRepo.create({
          user: createdUser._id,
          licenseNumber: req.body.licenseNumber,
          address: req.body.address,
          coordinates: req.body.coordinates,
          phoneNumber: req.body.phoneNumber,
          workingHours: req.body.workingHours,
          services: req.body.services,
          hasInsuranceSupport: req.body.hasInsuranceSupport,
          acceptedInsuranceProviders: req.body.acceptedInsuranceProviders,
        } as Pharmacy);
        break;
    }

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey,
    );
    const userData = await getUserData(createdUser);

    // Get the role-specific profile data
    let profileData = {};
    switch (req.body.role) {
      case RoleCode.PATIENT:
        const patient = await PatientRepo.findByUserId(createdUser._id);
        profileData = patient || {};
        break;
      case RoleCode.DOCTOR:
        const doctor = await DoctorRepo.findByUserId(createdUser._id);
        profileData = doctor || {};
        break;
      case RoleCode.AMBULANCE:
        const ambulance = await AmbulanceRepo.findByUserId(createdUser._id);
        profileData = ambulance || {};
        break;
      case RoleCode.PHARMACY:
        const pharmacy = await PharmacyRepo.findByUserId(createdUser._id);
        profileData = pharmacy || {};
        break;
    }

    new SuccessResponse('Signup Successful', {
      user: {
        ...userData,
        role: createdUser.role,
        ...profileData,
      },
      tokens: tokens,
    }).send(res);
  }),
);

export default router;
