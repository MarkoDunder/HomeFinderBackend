import { forwardRef, Module } from '@nestjs/common';
import { RedisModule } from 'src/redis.module';
import { PresenceController } from './presence.controlller';
import { PresenceService } from './presence.service';
import { PresenceGateway } from './presence.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  controllers: [PresenceController],
  providers: [PresenceService, PresenceGateway],
})
export class PresenceModule {}
