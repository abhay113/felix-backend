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