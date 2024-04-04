import { Listing } from 'src/listing/models/listing.interface';
import { Role } from './role.enum';

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  listings: Listing[];
}
