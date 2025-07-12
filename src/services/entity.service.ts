
// src/services/entity.service.ts
import { EntityDAO } from '../dao/entity.dao';
import { StellarService } from '../services/stellar.service';

export class EntityService {
  static async createEntityWithWalletAndAdmin(data: {
    name: string;
    type: string;
    description?: string;
    owner_id: string;
    created_by: string;
  }) {
    const { name, type, description, owner_id, created_by } = data;

    try {
      // 1. Create entity record
      const { data: entity, error } = await EntityDAO.createEntity({
        name,
        type,
        description,
        owner_id,
        created_by,
      });

      if (error || !entity) {
        throw new Error(error?.message || 'Failed to create entity.');
      }

      // 2. Call the existing service to create & setup Stellar wallet
      const account = await StellarService.createAndSetupAccount();

      // 3. Store the wallet in DB
      await EntityDAO.createWalletForEntity(
        entity.id,
        account.publicKey,
        account.secretKey,
        created_by
      );

      // 4. Add the owner as admin to membership table
      await EntityDAO.addMembership(owner_id, entity.id, created_by);

      return {
        message: 'Entity created and wallet setup successfully.',
        entity,
        walletPublicKey: account.publicKey,
        trustTransactionHash: account.trustTransactionHash
      };
    } catch (error: any) {
      console.error('Error in createEntityWithWalletAndAdmin:', error);
      throw new Error(`Failed to create entity with wallet: ${error.message}`);
    }
  }
}
