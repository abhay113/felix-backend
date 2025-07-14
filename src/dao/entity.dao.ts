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
}
