
// src/dao/entity.dao.ts
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.config';

interface CreateEntityInput {
    name: string;
    type: string;
    description?: string;
    owner_id: string;
    created_by: string;
}

export class EntityDAO {
    // Insert into `entities` table
    static async createEntity(input: CreateEntityInput) {
        const { name, type, description, owner_id, created_by } = input;

        const { data, error } = await supabase
            .from('entities')
            .insert([
                {
                    name,
                    type,
                    description,
                    owner_id,
                    created_by,
                    updated_by: created_by,
                },
            ])
            .select()
            .single();

        return { data, error };
    }

    // Insert into `wallets` table
    static async createWalletForEntity(
        owner_id: string,
        publicKey: string,
        secretKey: string,
        created_by: string
    ) {
        const { data, error } = await supabase
            .from('wallets')
            .insert([
                {
                    id: uuidv4(),
                    owner_type: 'entity',
                    owner_id,
                    public_key: publicKey,
                    secret_key: secretKey,
                    created_by,
                    updated_by: created_by,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating wallet: ${error.message}`);
        }

        return data;
    }

    // Insert into `memberships` table (to assign manager role to entity manager)
    static async addMembership(user_id: string, entity_id: string, created_by: string) {
        const { data, error } = await supabase
            .from('memberships')
            .insert([
                {
                    id: uuidv4(),
                    user_id,
                    entity_id,
                    role: 'manager',
                    created_by,
                    updated_by: created_by,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating membership: ${error.message}`);
        }

        return data;
    }
}
