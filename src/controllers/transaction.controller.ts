import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  // Make getTransation method static
  public static async getTransation(req: Request, res: Response): Promise<void> {
    try {
      const result = await TransactionService.getTransation(); // Call static method of TransactionService
      res.status(200).json(result);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'User get failed' });
    }
  }

  static async getUserTransactions(req: Request, res: Response) {
    const userId = req.query.userId as string;

    // if (!userId) {
    //   res.status(400).json({ error: 'Missing userId in query' });
    // }

    try {
      const transactions = await TransactionService.getUserTransactions(userId);
      res.status(200).json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
