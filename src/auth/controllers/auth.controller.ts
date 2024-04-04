import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register ')
  register(@Body() user: User): Observable<User> {
    return this.authService.registerAccount(user);
  }
}