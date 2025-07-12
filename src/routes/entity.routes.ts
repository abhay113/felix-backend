import express from 'express';
import { EntityController } from '../controllers/entity.controller';

const router = express.Router();

router.post('/entity/create', EntityController.createEntity);

export default router;
