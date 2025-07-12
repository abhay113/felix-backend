import express from 'express';
import { OfferController } from '../controllers/offer.controller';

const router = express.Router();

router.get('/offers', OfferController.getAvailableSellOffers);

export default router;
