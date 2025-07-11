import { UserDAO } from '../dao/users.dao'; // Assuming the DAO is now a class

export class UserService {
  // Static method to fetch users
  public static async getUsers() {
    try {
      const users = await UserDAO.getUsers(); // Call the static method from UserDAO
      return users;
    } catch (error) {
      console.error('Error while fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

   public static async getUsersByName(userName:string) {
    try {
      const users = await UserDAO.getUsersByName(userName); // Call the static method from UserDAO
      return users;
    } catch (error) {
      console.error('Error while fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }
}
