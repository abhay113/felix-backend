import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.get('/getTransation',authenticateToken,  TransactionController.getTransation)
router.get('/transactions',authenticateToken, TransactionController.getUserTransactions);

export default router;
