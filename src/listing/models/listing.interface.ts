import { User } from 'src/auth/models/user.interface';

export interface Listing {
  id?: number;
  title: string;
  createdAt: Date;
  creator: User;
}
