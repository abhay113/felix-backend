// stellar.routes.ts
import express from 'express';
import { StellarController } from '../controllers/stellar.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Single endpoint that does everything
router.post('/account/setup', StellarController.setupAccount);
// Send Blue Dollar tokens
router.post('/bluedollar/send', StellarController.sendBlueDollar);
// Check account balance
router.get('/account/balance/:publicKey',authenticateToken, StellarController.getBalance);
// Issue Blue DOllar to user
router.post('/bluedollar/issue', StellarController.issueBlueDollarToUser);
// check Blue DOllar balance
router.get('/account/bluedollar/:publicKey', StellarController.getAssetBalance);

// Create sell offer (selling BD for XLM)
router.post('/offers/sell', StellarController.createSellOffer);

// Create buy offer (buying BD with XLM)
router.post('/offers/buy', StellarController.createBuyOffer);

// Get all offers for an account
router.get('/offers/:publicKey', StellarController.getOffers);

export default router;