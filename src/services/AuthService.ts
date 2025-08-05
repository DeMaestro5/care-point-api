import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { BadRequestError, AuthFailureError } from '../core/ApiError';
import UserRepo from '../database/repository/UserRepo';
import KeystoreRepo from '../database/repository/KeystoreRepo';
import { createTokens, validateTokenData } from '../auth/authUtils';
import { getUserData } from '../routes/access/utils';
import { RoleCode } from '../database/model/Role';
import User from '../database/model/User';
import { Tokens } from '../types/app-request';
import JWT from '../core/JWT';
import PatientRepo from '../database/repository/PatientRepo';
import Patient from '../database/model/Patient';
import DoctorRepo from '../database/repository/DoctorRepo';
import Doctor from '../database/model/Doctor';
import AmbulanceRepo from '../database/repository/AmbulanceRepo';
import Ambulance from '../database/model/Ambulance';
import PharmacyRepo from '../database/repository/PharmacyRepo';
import Pharmacy from '../database/model/Pharmacy';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  profilePicUrl?: string;
  role?: string;
  // Role-specific fields
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  emergencyContact?: any;
  medicalHistory?: string[];
  specialization?: string;
  licenseNumber?: string;
  consultationFee?: number;
  yearsOfExperience?: number;
  qualification?: string;
  education?: string;
  certifications?: string[];
  availability?: any;
  hospital?: string;
  vehicleNumbers?: string[];
  vehicleTypes?: string[];
  equipments?: string[];
  serviceArea?: string;
  vehicleCount?: number;
  contactNumber?: string;
  operatingHours?: any;
  baseLocation?: string;
  crewMembers?: any[];
  address?: string;
  coordinates?: any;
  phoneNumber?: string;
  workingHours?: any;
  services?: string[];
  hasInsuranceSupport?: boolean;
  acceptedInsuranceProviders?: string[];
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: any;
  tokens: Tokens;
  role?: string;
  profileData?: any;
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const user = await UserRepo.findByEmail(data.email);
    if (user) throw new BadRequestError('User already registered');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(data.password, 10);

    const role = data.role || RoleCode.PATIENT;

    const { user: createdUser, keystore } = await UserRepo.create(
      {
        name: data.name,
        email: data.email,
        profilePicUrl: data.profilePicUrl,
        password: passwordHash,
      } as User,
      accessTokenKey,
      refreshTokenKey,
      role,
    );

    // Create role-specific profile based on the role
    let profileData = {};
    switch (role) {
      case RoleCode.PATIENT:
        await PatientRepo.create({
          user: createdUser._id,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          height: data.height,
          weight: data.weight,
          allergies: data.allergies,
          emergencyContact: data.emergencyContact,
          medicalHistory: data.medicalHistory,
        } as Patient);
        const patient = await PatientRepo.findByUserId(createdUser._id);
        profileData = patient || {};
        break;
      case RoleCode.DOCTOR:
        await DoctorRepo.create({
          user: createdUser._id,
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
          consultationFee: data.consultationFee,
          yearsOfExperience: data.yearsOfExperience,
          qualification: data.qualification,
          education: data.education,
          certifications: data.certifications,
          availability: data.availability,
          hospital: data.hospital,
        } as Doctor);
        const doctor = await DoctorRepo.findByUserId(createdUser._id);
        profileData = doctor || {};
        break;
      case RoleCode.AMBULANCE:
        await AmbulanceRepo.create({
          user: createdUser._id,
          vehicleNumbers: data.vehicleNumbers,
          vehicleTypes: data.vehicleTypes,
          equipments: data.equipments,
          serviceArea: data.serviceArea,
          vehicleCount: data.vehicleCount,
          contactNumber: data.contactNumber,
          operatingHours: data.operatingHours,
          baseLocation: data.baseLocation,
          crewMembers: data.crewMembers,
        } as Ambulance);
        const ambulance = await AmbulanceRepo.findByUserId(createdUser._id);
        profileData = ambulance || {};
        break;
      case RoleCode.PHARMACY:
        await PharmacyRepo.create({
          user: createdUser._id,
          licenseNumber: data.licenseNumber,
          address: data.address,
          coordinates: data.coordinates,
          phoneNumber: data.phoneNumber,
          workingHours: data.workingHours,
          services: data.services,
          hasInsuranceSupport: data.hasInsuranceSupport,
          acceptedInsuranceProviders: data.acceptedInsuranceProviders,
        } as Pharmacy);
        const pharmacy = await PharmacyRepo.findByUserId(createdUser._id);
        profileData = pharmacy || {};
        break;
    }

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey,
    );

    const userData = await getUserData(createdUser);

    return {
      user: userData,
      tokens,
      role,
      profileData,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await UserRepo.findByEmail(data.email);
    if (!user) throw new BadRequestError('User not registered');
    if (!user.password) throw new BadRequestError('Credential not set');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new AuthFailureError('Authentication failure');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
    const userData = await getUserData(user);

    return {
      user: userData,
      tokens,
    };
  }

  async validateToken(token: string): Promise<{ user: User; keystore: any }> {
    const payload = await JWT.validate(token);
    validateTokenData(payload);

    const user = await UserRepo.findById(new Types.ObjectId(payload.sub));
    if (!user) throw new AuthFailureError('User not registered');

    const keystore = await KeystoreRepo.findforKey(user, payload.prm);
    if (!keystore) throw new AuthFailureError('Invalid access token');

    return { user, keystore };
  }

  async refreshToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<Tokens> {
    const accessTokenPayload = await JWT.decode(accessToken);
    validateTokenData(accessTokenPayload);

    const user = await UserRepo.findById(
      new Types.ObjectId(accessTokenPayload.sub),
    );
    if (!user) throw new AuthFailureError('User not registered');

    const refreshTokenPayload = await JWT.validate(refreshToken);
    validateTokenData(refreshTokenPayload);

    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new AuthFailureError('Invalid access token');

    const keystore = await KeystoreRepo.find(
      user,
      accessTokenPayload.prm,
      refreshTokenPayload.prm,
    );

    if (!keystore) throw new AuthFailureError('Invalid access token');
    await KeystoreRepo.remove(keystore._id);

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    await KeystoreRepo.create(user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);

    return tokens;
  }

  async logout(keystoreId: Types.ObjectId): Promise<void> {
    await KeystoreRepo.remove(keystoreId);
  }

  async updatePassword(
    userId: Types.ObjectId,
    newPassword: string,
  ): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserRepo.updateInfo({
      _id: userId,
      password: passwordHash,
    } as User);
    await KeystoreRepo.removeAllForClient({ _id: userId } as User);
  }
}

export default new AuthService();
