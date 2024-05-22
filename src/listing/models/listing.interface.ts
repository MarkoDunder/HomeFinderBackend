import { User } from 'src/auth/models/user.interface';
import { ListingType } from './listingType.enum';

export interface Listing {
  id?: number;
  title: string;
  listingType: ListingType;
  price: number;
  description: string;
  isSaved: boolean;
  createdAt: Date;
  expiresAt: Date;
  //location: Location;
  creator: User;
}
