// stellar.routes.ts
import express from 'express';
import { StellarController } from '../controllers/stellar.controller';

const router = express.Router();

// Single endpoint that does everything
router.post('/account/setup', StellarController.setupAccount);
// Send Blue Dollar tokens
router.post('/bluedollar/send', StellarController.sendBlueDollar);
// Check account balance
router.get('/account/:publicKey/balance', StellarController.getBalance);
// Issue Blue DOllar to user
router.post('/bluedollar/issue', StellarController.issueBlueDollarToUser);
// check Blue DOllar balance
router.get('/account/bluedollar/:publicKey', StellarController.getAssetBalance);

export default router;