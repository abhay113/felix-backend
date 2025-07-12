import { supabase } from '../config/supabase.config';
import { TransactionData } from '../types/interface.types';

export class TransactionDAO {
  // Make getTransation a static method of the class
  public static async getTransation() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase getUsers error: ${error.message}`);
    }

    return data;
  }

  static async createTransaction(data: TransactionData): Promise<TransactionData> {
    try {
      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (error: any) {
      console.error('Create transaction error:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }
}
