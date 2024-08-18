import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { FriendRequestEntity } from './models/friend-request.entity';
import { ChatModule } from 'src/chat/chat.module';
import { AmazonS3UploadService } from './services/amazonS3.upload.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '3600s' },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
    ChatModule,
  ],
  providers: [
    AuthService,
    JwtGuard,
    JwtStrategy,
    RolesGuard,
    UserService,
    AmazonS3UploadService,
  ],
  controllers: [AuthController, UserController],
  exports: [AuthService, UserService, AmazonS3UploadService, TypeOrmModule],
})
export class AuthModule {}
