import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Keypair } from 'stellar-sdk';
import { keycloakConfig } from '../config/keycloak.config';
import { AuthDAO } from '../dao/auth.dao';
import { CreateUserDTO } from '../types/interface.types';

export class AuthService {
  // Convert createUser to a static method
  public static async createUser(dto: CreateUserDTO) {
    const userId = uuidv4();

    // Get the token for Keycloak
    const tokenRes = await axios.post(
      `${keycloakConfig.keycloakUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'admin',
        password: 'KcAdmin',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const token = tokenRes.data.access_token;

    // Create user in Keycloak
    await axios.post(
      `${keycloakConfig.keycloakUrl}/admin/realms/${keycloakConfig.realm}/users`,
      {
        username: dto.email,
        email: dto.email,
        enabled: true,
        attributes: {
          full_name: dto.fullName,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Create Stellar keypair
    const stellarPair = Keypair.random();

    // Insert user to DB
    await AuthDAO.insertUserToDB({
      id: userId,
      email: dto.email,
      username: dto.username,
      created_by: dto.createdBy,
    });

    return {
      userId,
      email: dto.email,
      stellarPublicKey: stellarPair.publicKey(),
      stellarSecretKey: stellarPair.secret(),
    };
  }
}
