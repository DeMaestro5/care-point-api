import express from 'express';
import apikey from '../auth/apikey';
import permission from '../helpers/permission';
import { Permission } from '../database/model/ApiKey';
import signup from './access/signup';
import login from './access/login';
import logout from './access/logout';
import token from './access/token';
import resetPassword from './access/reset-password';
import patientRoutes from './patient';
import doctorRoutes from './doctor';
import staffRoutes from './staff';
import ambulanceRoutes from './ambulance';
import pharmacyRoutes from './pharmacy';
import appointmentRoutes from './appointment';
import prescriptionRoutes from './prescription';
import telemedicineRoutes from './telemedicine';
import insuranceRoutes from './insurance';
import notificationRoutes from './notifications';
import analyticsRoutes from './analytics';
import medicalRecordsRoutes from './medical-records';
import medicationRoutes from './medication';
import laboratoryRoutes from './laboratory';
import referralRoutes from './referrals';
import adminRoutes from './admin';
import carePlanRoutes from './care-plans';
import documentRoutes from './documents';
import communicationRoutes from './communication';
import inventoryRoutes from './inventory';
import configurationRoutes from './configuration';
import mobileRoutes from './mobile';
import reportsAndExportsRoutes from './reports-and-exports';
import calendarRoutes from './calendar';
import healthEducationRoutes from './health-education';

const router = express.Router();

/*---------------------------------------------------------*/
router.use(apikey);
/*---------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
router.use('/api/v1/signup', signup);
router.use('/api/v1/login', login);
router.use('/api/v1/logout', logout);
router.use('/api/v1/token', token);
router.use('/api/v1/reset-password', resetPassword);
router.use('/api/v1/patients', patientRoutes);
router.use('/api/v1/doctors', doctorRoutes);
router.use('/api/v1/staff', staffRoutes);
router.use('/api/v1/ambulance-services', ambulanceRoutes);
router.use('/api/v1/pharmacies', pharmacyRoutes);
router.use('/api/v1/appointments', appointmentRoutes);
router.use('/api/v1/prescriptions', prescriptionRoutes);
router.use('/api/v1/telemedicine', telemedicineRoutes);
router.use('/api/v1/insurance', insuranceRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use('/api/v1/analytics', analyticsRoutes);
router.use('/api/v1/medical-records', medicalRecordsRoutes);
router.use('/api/v1/medications', medicationRoutes);
router.use('/api/v1/laboratory', laboratoryRoutes);
router.use('/api/v1/referrals', referralRoutes);
router.use('/api/v1/admin', adminRoutes);
router.use('/api/v1/care-plans', carePlanRoutes);
router.use('/api/v1/documents', documentRoutes);
router.use('/api/v1/messages', communicationRoutes);
router.use('/api/v1/inventory', inventoryRoutes);
router.use('/api/v1/configuration', configurationRoutes);
router.use('/api/v1/mobile', mobileRoutes);
router.use('/api/v1/reports', reportsAndExportsRoutes);
router.use('/api/v1/calendar', calendarRoutes);
router.use('/api/v1/education', healthEducationRoutes);

export default router;
