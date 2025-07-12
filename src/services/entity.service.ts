import { EntityDAO } from '../dao/entity.dao';
import { StellarService } from '../services/stellar.service'; // Assuming you put your account setup logic here

export class EntityService {
  static async createEntityWithWalletAndAdmin(data: {
    name: string;
    type: string;
    description?: string;
    owner_id: string;
    created_by: string;
  }) {
    const { name, type, description, owner_id, created_by } = data;

    // 1. Create entity record
    const { data: entity, error } = await EntityDAO.createEntity({
      name,
      type,
      description,
      owner_id,
      created_by,
    });

    if (error || !entity) throw error || new Error('Failed to create entity.');

    // 2. Call the existing service to create & setup Stellar wallet
    const account = await StellarService.createAndSetupAccount();

    // 3. Store the wallet in DB
    const { error: walletError } = await EntityDAO.createWalletForEntity(
      entity.id,
      account.publicKey,
      account.secretKey,
      created_by
    );
    if (walletError) throw walletError;

    // 4. Add the owner as admin to membership table
    const { error: memberError } = await EntityDAO.addMembership(owner_id, entity.id, created_by);
    if (memberError) throw memberError;

    return {
      message: 'Entity created and wallet setup successfully.',
      entity,
      walletPublicKey: account.publicKey,
      trustTransactionHash: account.trustTransactionHash
    };
  }
}
