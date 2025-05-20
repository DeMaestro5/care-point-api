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

export default router;
