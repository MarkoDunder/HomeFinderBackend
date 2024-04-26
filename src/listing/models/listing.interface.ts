import { User } from 'src/auth/models/user.interface';

export interface Listing {
  id?: number;
  title: string;
  /* listingType: ListingType;
  price: number;
  descritpion: Text; */
  createdAt: Date;
  creator: User;
}
