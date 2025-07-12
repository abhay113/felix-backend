import { Router } from 'express';
import { UserController } from '../controllers/users.controller';

const router = Router();

router.get('/getAllUsers', UserController.getUser)
router.get('/getUser/:name', UserController.getUserByname)

export default router;
