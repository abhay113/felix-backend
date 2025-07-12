import express from 'express';
import { EntityController } from '../controllers/entity.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/entity/create',authenticateToken, EntityController.createEntity);

export default router;
