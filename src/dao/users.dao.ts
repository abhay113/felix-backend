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


 public static async getUsersByName(userName: string) {
  // Fetch the user directly, assuming username is unique
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq("username", userName)
    .single(); // Use .single() to expect one or zero results

  if (userError && userError.code !== 'PGRST116') { // PGRST116 indicates no rows found
    console.error("Supabase getUser error:", userError.message);
    throw new Error(`Supabase getUser error: ${userError.message}`);
  }

  // If no user is found, return null
  if (!user) {
    console.log(`No user found with username: ${userName}, returning null.`);
    return null;
  }

  console.log("Fetched user data:", user);

  // Fetch the wallet for the found user
  const { data: walletData, error: walletsError } = await supabase
    .from('wallets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .single();

  if (walletsError && walletsError.code !== 'PGRST116') {
    console.error(`Supabase wallets error for user ${user.id}:`, walletsError.message);
    // Even if wallet fetch fails, we still return the user object, just with a null wallet
    return { ...user, wallet: null };
  }

  console.log("walletDatawalletData", walletData);
  const userWithWallet = { ...user, wallet: walletData };

  console.log("Fetched user with their wallet:", userWithWallet);
  return userWithWallet;
}


  
}
