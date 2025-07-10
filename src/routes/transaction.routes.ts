import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
router.get('/getTransation',  TransactionController.getTransation)

export default router;
