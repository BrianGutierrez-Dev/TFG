import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import clientRoutes from './client.routes';
import carRoutes from './car.routes';
import rentalRoutes from './rental.routes';
import carReturnRoutes from './carReturn.routes';
import incidentRoutes from './incident.routes';
import maintenanceRoutes from './maintenance.routes';
import repairRoutes from './repair.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/clients', clientRoutes);
router.use('/cars', carRoutes);
router.use('/rentals', rentalRoutes);
router.use('/car-returns', carReturnRoutes);
router.use('/incidents', incidentRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/repairs', repairRoutes);

export default router;
