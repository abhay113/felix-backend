import { supabase } from '../config/supabase.config';

export class UserDAO {
  public static async getUsers() {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false }); 

    if (usersError) {
      console.error("Supabase getUsers error:", usersError.message);
      throw new Error(`Supabase getUsers error: ${usersError.message}`);
    }

    console.log("Fetched users data:", users);

    if (!users || users.length === 0) {
      console.log("No users found, returning empty array.");
      return [];
    }

    const usersWithWalletsPromises = users.map(async (user) => {
      console.log("useruser", user); 

      const { data: walletData, error: walletsError } = await supabase
        .from('wallets') 
        .select('*')     
        .eq('owner_id', user.id) 
        .order('created_at', { ascending: false }) 
        .single(); 

      if (walletsError && walletsError.code !== 'PGRST116') { 
        console.error(`Supabase wallets error for user ${user.id}:`, walletsError.message);
        return { ...user, wallet: null };
      } else {
        console.log("walletDatawalletData", walletData); 
        return { ...user,  walletData };
      }
    });

    const usersWithWallets = await Promise.all(usersWithWalletsPromises);

    console.log("Fetched users with their wallets:", usersWithWallets);
    return usersWithWallets;
  }

}
