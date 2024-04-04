import { User } from 'src/auth/models/user.interface';

export interface Listing {
  id?: number;
  createdAt: Date;
  creator: User;
}
