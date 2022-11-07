import { Router } from 'express';
import reqMaintenanceController from '../controllers/ReqMaintenanceController';

const router = new Router();

router.post('/', reqMaintenanceController.store);

export default router;
