import { Request, Response } from 'express';
import { EntityService } from '../services/entity.service';

export class EntityController {
  static async createEntity(req: Request, res: Response) {
    try {
      const result = await EntityService.createEntityWithWallet(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      console.error('Entity creation failed:', err);
      res.status(500).json({ error: err.message });
    }
  }
  static async getEntities(req: Request, res: Response) {
    try {
      const result = await EntityService.fetchEntitiesWithWalletAndManager();
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Error fetching entities:', err);
      res.status(500).json({ error: err.message });
    }
  }
  public static async getWalletDataofEntity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log('userId for entity wallet data:', userId);

      const result = await EntityService.getWalletDataofEntity(userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'Failed to fetch entity wallet data' });
    }
  }
}
