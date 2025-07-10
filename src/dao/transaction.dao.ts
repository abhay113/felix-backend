import { supabase } from '../config/supabase.config';

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
}
