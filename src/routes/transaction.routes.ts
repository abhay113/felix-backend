import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
router.get('/getTransation',  TransactionController.getTransation)
router.get('/transactions', TransactionController.getUserTransactions);

export default router;
