import { supabase } from '../config/supabase.config';
import { OfferData } from '../types/interface.types';

export class OfferDAO {
   static async createOffer(offerData:OfferData) {
        try {
            const { data, error } = await supabase
                .from('offers')
                .insert([offerData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Create offer error:', error);
            throw new Error(`Failed to create offer: ${error.message}`);
        }
    }

   static async updateOfferStatus(
    {
    id,
    status,
    updated_by,
    buyer_id,
    type
    }: {
    id: any;
    status?: string;
    updated_by?: string;
    buyer_id?: string;
    type?: string;
    }
   ) {
        try {
            const { data, error } = await supabase
                .from('offers')
                .update({
                    status,
                    type,
                    updated_at: new Date().toISOString(),
                    updated_by: updated_by,
                    buyer_id: buyer_id
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Update offer status error:', error);
            throw new Error(`Failed to update offer status: ${error.message}`);
        }
    }

    static async getActiveSellOffersExcludingUser(userId: string) {
    try {
        const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('type', 'sell')
        .eq('status', 'active')
        .neq('seller_id', userId);

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Get active sell offers error:', error);
        throw new Error(`Failed to fetch active sell offers: ${error.message}`);
    }
    }
}
