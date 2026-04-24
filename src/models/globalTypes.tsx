export type Role = 'admin' | 'user';

export type User = {
  id: string;
  email: string;
  first_name: string; 
  last_name: string;
  dob: string;
  role: Role
  jointedAt: string;
  avatar: string;
  color: string;
  disabled: boolean;
} 
