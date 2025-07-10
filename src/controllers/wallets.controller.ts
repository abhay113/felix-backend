import { Request, Response } from 'express';
import { WalletsService } from '../services/wallets.service';

export class WalletsController {
  // Static method for handling GET requests
  public static async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const result = await WalletsService.getWallets(); // Call static method from WalletsService
      res.status(200).json(result); // Return the result (wallets data)
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  }
}
