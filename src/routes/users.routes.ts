import { Router } from 'express';
import { UserController } from '../controllers/users.controller';

const router = Router();

router.get('/getUser', UserController.getUser)
router.get('/getUserByname/:name', UserController.getUserByname)

export default router;
