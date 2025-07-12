

import { Request, Response } from 'express';
import { EntityService } from '../services/entity.service';
// src/controllers/EntityController.ts

export class EntityController {
  static async createEntity(req: Request, res: Response) {
    try {
      const { name, type, description, owner_id, created_by } = req.body;

      // Validate `type` is either 'project' or 'coe'
      const allowedTypes = ['project', 'coe'];
      if (!allowedTypes.includes(type.toLowerCase())) {
         res.status(400).json({
          error: `Invalid entity type: ${type}. Only 'project' or 'coe' are allowed.`,
        });
      }

      const entity = await EntityService.createEntityWithWalletAndAdmin({
        name,
        type: type.toLowerCase(),
        description,
        owner_id,
        created_by,
      });

       res.status(201).json(entity);
    } catch (err: any) {
       res.status(500).json({ error: err.message });
    }
  }
}
