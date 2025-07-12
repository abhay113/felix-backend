import { Router } from 'express';
import { WalletsController } from '../controllers/wallets.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/getwallet',authenticateToken,  WalletsController.getWallet)

export default router;



