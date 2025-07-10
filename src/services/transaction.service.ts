import { TransactionDAO } from '../dao/transaction.dao';

export class TransactionService {
  // Convert getTransation method to static
  public static async getTransation() {
    try {
      const users = await TransactionDAO.getTransation();
      return users;
    } catch (error) {
      console.error('Error while fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }
}
