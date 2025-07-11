import { Request, Response } from 'express';
import { UserService } from '../services/users.service';

export class UserController {

  // Static method to handle the GET request
  public static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await UserService.getUsers(); // Call static method from UserService
      res.status(200).json(result); // Return users
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'User get failed' });
    }
  }

   public static async getUserByname(req: Request, res: Response): Promise<void> {
    try {
      const userName = req.params.name
      console.log('userNameuserName',userName);
      
      const result = await UserService.getUsersByName(userName); // Call static method from UserService
      res.status(200).json(result); // Return users
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: 'User get failed' });
    }
  }
}
