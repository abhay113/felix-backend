import { Router } from 'express';
import { UserController } from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/getAllUsers',authenticateToken, UserController.getUser)
router.get('/getUser/:name',authenticateToken, UserController.getUserByname)

export default router;
