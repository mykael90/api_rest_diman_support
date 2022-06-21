import { Router } from 'express';
import reqMaterialController from '../controllers/ReqMaterialController';

const router = new Router();

router.get('/:reqmat', reqMaterialController.index);

export default router;
