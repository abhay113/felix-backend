import { WalletsDAO } from '../dao/wallets.dao'; // Assuming the DAO class is called WalletsDAO

export class WalletsService {
  // Static method for getting wallets
  public static async getWallets() {
    try {
      const wallets = await WalletsDAO.getWallets(); // Call the static method from WalletsDAO
      return wallets; // Return the fetched wallets data
    } catch (error) {
      console.error('Error while fetching wallets:', error);
      throw new Error('Failed to fetch wallets');
    }
  }
}
