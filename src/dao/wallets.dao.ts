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

 public static async insertWalletToDB(wallet: {
    owner_id: string;
    public_key: string;
    secret_key: string;
    balance: number;
    created_at: string;
    created_by: any;
}) {
    const { error } = await supabase.from('wallets').insert([wallet]);
    
    if (error) {
        console.error('Error inserting wallet into DB:', error);
        throw new Error('Failed to insert wallet');
    }
}
}
