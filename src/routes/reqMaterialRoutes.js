import { Router } from 'express';
import reqMaterialController from '../controllers/ReqMaterialController';
import reqMaterialReserveController from '../controllers/ReqMaterialReserveController';

const router = new Router();

router.get('/:reqmat', reqMaterialController.index);
router.post('/', reqMaterialController.store);

router.post('/reserve', reqMaterialReserveController.store);

export default router;
