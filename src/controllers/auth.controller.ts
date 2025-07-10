import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../types/interface.types';

export class AuthController {
  // Make the createUser method static
  public static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const body: CreateUserDTO = req.body;
      const result = await AuthService.createUser(body); // Call the static method from AuthService
      res.status(201).json(result);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'User creation failed' });
    }
  }
}
