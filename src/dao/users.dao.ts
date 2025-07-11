import { supabase } from '../config/supabase.config';

export class UserDAO {
  // Static method to fetch users from the 'users' table
  public static async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false }); // Sorting by creation date in descending order

    if (error) {
      throw new Error(`Supabase getUsers error: ${error.message}`);
    }

    console.log("datadatadatadata",data);
    
    return data;
  }
}
