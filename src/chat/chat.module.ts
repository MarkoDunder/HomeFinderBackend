import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './model/conversation.entity';
import { MessageEntity } from './model/message.entity';
import { PresenceModule } from './presence/presence.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisCacheService } from 'src/redis.cache.service';
import { PresenceService } from './presence/presence.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    PresenceModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    ChatGateway,
    ChatService,
    RedisCacheService,
    PresenceService,
    JwtService,
  ],
})
export class ChatModule {}
