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

export default router;
