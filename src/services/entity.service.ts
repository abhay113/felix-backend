import { EntityDAO } from '../dao/entity.dao';
import { KeycloakAdminService } from './keycloak.service';
import { StellarService } from './stellar.service';

export class EntityService {
  static async createEntityWithWallet({
     name,
    type,
    owner_id,
    members,
    created_by,
  }: {
     name: string;
    type: string;
    owner_id: string;
    members: string[];
    created_by: string;
  }) {
  // 1. Create Keycloak subgroup first
  let subGroupId: string | null = null;
  try {
    const kc = new KeycloakAdminService();

    // Find parent group, e.g., "projects"
    const parentGroupId = await kc.getGroupIdByName(type);
    if (!parentGroupId) throw new Error(`Keycloak group "${type}" not found`);

    // Create subgroup, e.g., "GSLP"
    subGroupId = await kc.createSubgroup(parentGroupId, name);
    console.log("subGroupId---123",subGroupId)
    if (!subGroupId) throw new Error(`Failed to create subgroup "${name}" under "${type}"`);
  } catch (err) {
    console.error('Keycloak subgroup creation failed:', err);
    throw new Error('Failed to create Keycloak subgroup.');
  }

  // 2. Add users to Keycloak subgroup
  try {
    const kc = new KeycloakAdminService();
    // const userIds = Array.from(new Set([owner_id, ...members]));
  const memberArray = Array.isArray(members) ? members : [];

  const userIds = Array.from(new Set([owner_id, ...memberArray]));

    console.log("userIds--->",userIds)
    for (const userId of userIds) {
      
      await kc.addUserToGroup(userId, subGroupId!);
    }
  } catch (err) {
    console.error('Failed to add users to Keycloak subgroup:', err);
    throw new Error('Failed to assign users to Keycloak group.');
  }

  // 3. Create entity in DB
  const { data: entity, error } = await EntityDAO.createEntity({
    name,
    type,
    owner_id: owner_id,
    created_by,
  });

  if (error || !entity) throw new Error(error?.message || 'Entity creation failed.');

  // 4. Create wallet
  const wallet = await StellarService.createAndSetupAccount();
  await EntityDAO.createWalletForEntity(entity.id, wallet.publicKey, wallet.secretKey, created_by);

  // 5. Add members to entity
  await EntityDAO.addMembership(owner_id, entity.id, 'manager', created_by);
  if (members.length > 0) {
    await EntityDAO.addMultipleMembers(members, entity.id, 'member', created_by);
  }

  return {
    message: 'Project created successfully with wallet and Keycloak group.',
    entity,
    walletPublicKey: wallet.publicKey,
    trustTransactionHash: wallet.trustTransactionHash,
    membersAdded: {
      manager: owner_id,
      members: members,
      total: members.length + 1,
    },
  };
  }
  static async fetchEntitiesWithWalletAndManager() {
    return await EntityDAO.getEntitiesWithWalletAndManager();
  }
  public static async getWalletDataofEntity(userId: string) {
    try {
      const entitiesWithWallets = await EntityDAO.getWalletDataofEntity(userId);
      return entitiesWithWallets;
    } catch (error) {
      console.error('Error while fetching entity wallet data:', error);
      throw new Error('Failed to fetch entity wallet data');
    }
  }
}
