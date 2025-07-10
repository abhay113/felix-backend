import { Router } from 'express';
import { WalletsController } from '../controllers/wallets.controller';

const router = Router();

router.get('/getwallet',  WalletsController.getWallet)



export default router;



