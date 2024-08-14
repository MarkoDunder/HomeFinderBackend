import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './model/conversation.entity';
import { MessageEntity } from './model/message.entity';
import { PresenceModule } from './presence/presence.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    PresenceModule,
    forwardRef(() => AuthModule),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
