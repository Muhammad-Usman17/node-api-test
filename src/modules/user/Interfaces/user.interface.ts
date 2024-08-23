import { UserRole } from '../entities/user.entity';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  accessToken?: string;
}
