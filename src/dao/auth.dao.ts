import { supabase } from '../config/supabase.config';

export class AuthDAO {
  // Convert insertUserToDB to a static method
  public static async insertUserToDB(user: {
    id: string;
    email: string;
    username: string;
    created_by?: string;
  }) {
    const { error } = await supabase.from('users').insert([user]);

    if (error) {
      console.error('Error inserting user into DB:', error);
      throw new Error('Failed to insert user');
    }
  }
}
