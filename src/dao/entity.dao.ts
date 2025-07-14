import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.config';

export class EntityDAO {
    static async createEntity(input: {
        name: string;
        type: string;
        description?: string;
        owner_id: string;
        created_by: string;
    }) {
        return await supabase
            .from('entities')
            .insert([{ ...input, updated_by: input.created_by }])
            .select()
            .single();
    }

    static async createWalletForEntity(
        owner_id: string,
        publicKey: string,
        secretKey: string,
        created_by: string
    ) {
        const { error } = await supabase
            .from('wallets')
            .insert([{
                id: uuidv4(),
                owner_type: 'entity',
                owner_id,
                public_key: publicKey,
                secret_key: secretKey,
                created_by,
                updated_by: created_by,
            }])
            .select()
            .single();

        if (error) throw new Error(`Wallet creation failed: ${error.message}`);
    }

    static async addMembership(user_id: string, entity_id: string, role: string, created_by: string) {
        const { error } = await supabase
            .from('memberships')
            .insert([{
                id: uuidv4(),
                user_id,
                entity_id,
                role,
                created_by,
                updated_by: created_by,
            }])
            .select()
            .single();

        if (error) throw new Error(`Membership creation failed: ${error.message}`);
    }

    static async addMultipleMembers(user_ids: string[], entity_id: string, role: string, created_by: string) {
        const rows = user_ids.map(user_id => ({
            id: uuidv4(),
            user_id,
            entity_id,
            role,
            created_by,
            updated_by: created_by,
        }));

        const { error } = await supabase.from('memberships').insert(rows).select();
        if (error) throw new Error(`Bulk membership insert failed: ${error.message}`);
    }

    static async getEntitiesWithWalletAndManager() {
        try {
            // First, get all entities with their owners
            const { data: entitiesData, error: entitiesError } = await supabase
                .from('entities')
                .select(`
          id,
          name,
          type,
          description,
          owner_id,
          created_at,
          updated_at,
          users!fk_entities_owner(
            id,
            username
          )
        `);

            if (entitiesError) throw new Error(entitiesError.message);

            // Then get wallet information for each entity
            const entityIds = entitiesData.map(entity => entity.id);

            const { data: walletsData, error: walletsError } = await supabase
                .from('wallets')
                .select('id, owner_id, public_key')
                .eq('owner_type', 'entity')
                .in('owner_id', entityIds);

            if (walletsError) throw new Error(walletsError.message);

            // Create a map of wallets by owner_id for quick lookup
            const walletMap = new Map();
            walletsData.forEach(wallet => {
                walletMap.set(wallet.owner_id, wallet);
            });

            // Combine the data
            return entitiesData.map((entity: any) => {
                const wallet = walletMap.get(entity.id);

                return {
                    entity_id: entity.id,
                    entity_name: entity.name,
                    type: entity.type,
                    description: entity.description || null,
                    created_at: entity.created_at,
                    updated_at: entity.updated_at,
                    wallet_id: wallet?.id || null,
                    wallet_public_key: wallet?.public_key || null,
                    owner_id: entity.owner_id,
                    owner_name: entity.users?.username || null,
                };
            });
        } catch (error: any) {
            throw new Error(`Error fetching entities: ${error.message}`);
        }
    }
}
