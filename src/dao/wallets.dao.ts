import { supabase } from '../config/supabase.config';

export class WalletsDAO {
  // Static method to fetch wallets from the 'wallets' table
  public static async getWallets() {
    const { data, error } = await supabase
      .from('wallets')
      .select('*'); // Select all columns from the 'wallets' table

    if (error) {
      throw new Error(`Supabase getWallets error: ${error.message}`);
    }

    return data; // Return fetched wallet data
  }
}
