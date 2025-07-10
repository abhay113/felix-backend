import { Router } from 'express';
import { UserController } from '../controllers/users.controller';

const router = Router();

router.get('/getUser', UserController.getUser)

export default router;
