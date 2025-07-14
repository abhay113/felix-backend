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
}
