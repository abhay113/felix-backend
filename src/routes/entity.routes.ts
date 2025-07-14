import express from 'express';
import { EntityController } from '../controllers/entity.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/entity/create', EntityController.createEntity);
// router.get('/entity/:id', authenticateToken, EntityController.getEntityById);
router.get('/entities', EntityController.getEntities);
router.get('/getwalletDataofEntity/:userId', authenticateToken, EntityController.getWalletDataofEntity);

export default router;
