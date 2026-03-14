import { Router } from 'express';
import { PlatformController } from '../controllers/platformController';

const router = Router();

router.get('/', PlatformController.getAllPlatforms);
router.get('/:platformId/categories', PlatformController.getPlatformCategories);

export default router;
