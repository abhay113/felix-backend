import { EntityDAO } from '../dao/entity.dao';
import { StellarService } from './stellar.service';

export class EntityService {
  static async createEntityWithWallet({
    name,
    type,
    description,
    owner_id,
    members,
    created_by,
  }: {
    name: string;
    type: string;
    description?: string;
    owner_id: string;
    members: string[];
    created_by: string;
  }) {
    const { data: entity, error } = await EntityDAO.createEntity({
      name,
      type,
      description,
      owner_id,
      created_by,
    });

    if (error || !entity) throw new Error(error?.message || 'Entity creation failed.');

    const wallet = await StellarService.createAndSetupAccount();

    await EntityDAO.createWalletForEntity(entity.id, wallet.publicKey, wallet.secretKey, created_by);
    await EntityDAO.addMembership(owner_id, entity.id, 'manager', created_by);

    if (members.length > 0) {
      await EntityDAO.addMultipleMembers(members, entity.id, 'member', created_by);
    }

    return {
      message: 'Entity created successfully with wallet and members.',
      entity,
      walletPublicKey: wallet.publicKey,
      trustTransactionHash: wallet.trustTransactionHash,
      membersAdded: {
        manager: owner_id,
        members,
        total: members.length + 1,
      },
    };
  }
}
