import { User } from 'src/auth/models/user.interface';

export interface UserJwt extends User {
  iat?: number; // Issued At
  exp?: number; // Expiration Time
}
