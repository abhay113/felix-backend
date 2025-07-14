import express from 'express';
import { EntityController } from '../controllers/entity.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/entity/create', authenticateToken, EntityController.createEntity);
// router.get('/entity/:id', authenticateToken, EntityController.getEntityById);
// router.get('/entities', authenticateToken, EntityController.getAllEntities);
export default router;
