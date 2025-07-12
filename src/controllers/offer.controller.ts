// src/controllers/offer.controller.ts

import { Request, Response } from 'express';
import { OfferService } from '../services/offer.service';

export class OfferController {
  static async getAvailableSellOffers(req: Request, res: Response) {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in query parameters' });
    }

    try {
      const offers = await OfferService.getAvailableSellOffers(userId);
      res.status(200).json({ offers });
    } catch (error: any) {
      console.error('Error fetching sell offers:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
