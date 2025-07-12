import express from 'express';
import { OfferController } from '../controllers/offer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/offers',authenticateToken , OfferController.getAvailableSellOffers);

export default router;
