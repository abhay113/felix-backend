export interface payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  username: string;
  name: string;
  email: string;
  fullName: string;
  created_by?: string;
  password:string
}

export interface OfferData {
    id?: string;
    type: 'buy' | 'sell';
    amount: number;
    buyer_id?: string;
    seller_id?: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
    service_name?: string;
    desc?:string
}

export interface TransactionData {
    id?: string;
    sender_id: string;
    receiver_id: string;
    asset_code: string;
    amount: number;
    memo?: string;
    tx_hash?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}
