import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Keypair } from 'stellar-sdk';
import { keycloakConfig } from '../config/keycloak.config';
import { AuthDAO } from '../dao/auth.dao';
import { WalletsDAO } from '../dao/wallets.dao';
import { CreateUserDTO } from '../types/interface.types';

export class AuthService {
  // Convert createUser to a static method
 public static async createUser(dto: CreateUserDTO) {
    const userId = uuidv4(); // Generate a unique ID for the user

    let token: string = ''; // Initialize token
    let keycloakUserId: string | undefined;
    let groups: any[] = [];

    try {
      // --- Step 1: Obtain an admin token from Keycloak ---
      // This token is required to interact with Keycloak's admin API
      const tokenRes = await axios.post(
        `${keycloakConfig.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password', // Using password grant type for admin-cli
          client_id: 'admin-cli', // The client ID for Keycloak's admin CLI
          username: 'admin', // Keycloak admin username
          password: 'KcAdmin', // Keycloak admin password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Required content type for token endpoint
          },
        }
      );

      token = tokenRes.data.access_token; // Extract the access token

      // --- Step 2: Create user in Keycloak ---
      // Use the obtained admin token to create a new user in the specified realm
      await axios.post(
        `${keycloakConfig.keycloakUrl}/admin/realms/${keycloakConfig.realm}/users`,
        {
          username: dto.name,
          email: dto.email,
          enabled: true, // Enable the user upon creation
          credentials: [
            {
              type: 'password',
              value: dto.password,
              temporary: false, // Set to false so the password is not temporary
            },
          ],
          attributes: {
            full_name: [dto.fullName], // Custom attributes must be arrays in Keycloak
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Authorize the request with the admin token
        }
      );

      // --- Step 3: Get the newly created user's Keycloak ID ---
      const userSearchRes = await axios.get(
        `${keycloakConfig.keycloakUrl}/admin/realms/${keycloakConfig.realm}/users?email=${encodeURIComponent(dto.email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const keycloakUser = userSearchRes.data[0]; // Assuming email is unique and returns one user
      if (!keycloakUser) {
        throw new Error('Could not find created user in Keycloak after creation.');
      }
      keycloakUserId = keycloakUser.id;
      console.log(`Keycloak User ID for ${dto.email}: ${keycloakUserId}`);

      // --- Step 4: Get all groups from Keycloak ---
      // This is needed to find the ID of the group the user should be assigned to.
      const groupsRes = await axios.get(
        `${keycloakConfig.keycloakUrl}/admin/realms/${keycloakConfig.realm}/groups`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Use the same admin token for authorization
        }
      );
      groups = groupsRes.data; // Extract the groups data
      console.log('Keycloak Groups fetched:', groups); // Log the fetched groups for debugging
      
      const groupName = "users";
      
      // --- Step 5: Assign user to a specific group (if groupName is provided) ---
      if (keycloakUserId) {
        const targetGroup = groups.find((group: any) => group.name === groupName);

        if (targetGroup) {
          // Perform the PUT request to assign the user to the group
          await axios.put(
            `${keycloakConfig.keycloakUrl}/admin/realms/${keycloakConfig.realm}/users/${keycloakUserId}/groups/${targetGroup.id}`,
            {}, // Empty body for PUT request to assign group
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(`User '${dto.name}' (ID: ${keycloakUserId}) assigned to group '${groupName}' (ID: ${targetGroup.id}) successfully.`);
        } else {
          console.warn(`Group '${groupName}' not found in Keycloak. User not assigned to this group.`);
        }
      }
    } catch (error) {
      console.error('Error during Keycloak user creation or group assignment:', error);
      throw error;
    }

    // --- Step 6: Create Stellar keypair ---
    const stellarPair = Keypair.random();
    console.log("stellarPairstellarPairstellarPair", stellarPair); // Keeping this log as requested

    // --- Step 7: Insert user details into your application's database ---
    await AuthDAO.insertUserToDB({
      id: userId,
      email: dto.email,
      username: dto.name,
      created_by: dto.created_by,
    });

    await WalletsDAO.insertWalletToDB({
      owner_id: userId,
      public_key: stellarPair.publicKey(), // Use the method instead of private property
      secret_key: stellarPair.secret(), // Use the method instead of private property
      balance: 0,
      created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
      created_by: dto.created_by,
    });

    // --- Step 8: Return user details and fetched groups ---
    return {
      userId,
      email: dto.email,
      stellarPublicKey: stellarPair.publicKey(),
      stellarSecretKey: stellarPair.secret(),
      keycloakGroups: groups, // Include the fetched Keycloak groups in the response
      assignedKeycloakUserId: keycloakUserId, // Include the Keycloak user ID for reference
    };
  }
}
