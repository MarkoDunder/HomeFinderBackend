import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../presence/presence.service';
import { RedisCacheService } from 'src/redis.cache.service';
import { ChatService } from '../chat.service';
import { JwtService } from '@nestjs/jwt';
import { UserJwt } from '../presence/interfaces/UserJwt.interface';
import { firstValueFrom, from } from 'rxjs';
import { UserService } from 'src/auth/services/user.service';
import { NewMessageDTO } from '../dto/NewMessageDTO';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly cache: RedisCacheService,
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    console.log('HANDLE CONNECTION - CONVO');

    const jwt = socket.handshake.headers.authorization ?? null;

    if (!jwt) {
      this.handleDisconnect(socket);
      return;
    }

    const ob$ = from(this.jwtService.verifyAsync<UserJwt>(jwt));
    const res = await firstValueFrom(ob$).catch((error) =>
      console.error(error),
    );

    if (!res || !res?.id) {
      this.handleDisconnect(socket);
      return;
    }

    socket.data.user = res;
  }
  /* 
  private async createConversations(socket: Socket, userId: number) {
    try {
      const currentUser: User = await firstValueFrom(
        this.userService.findUserById(userId),
      );
      const ob2$ = this.userService.getFriends(currentUser);

      const friends = await firstValueFrom(ob2$).catch((error) =>
        console.error(error),
      );

      if (Array.isArray(friends)) {
        for (const friend of friends) {
          await this.chatService.createConversation(userId, friend.id);
        }
      } else {
        console.error('No friends were found for user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } */

  private async setConversationUser(socket: Socket) {
    const user = socket.data?.user;

    if (!user || !user.id) return;

    const conversationUser = { id: user.id, socketId: socket.id };

    await this.cache.set(`conversationUser ${user.id}`, conversationUser);
  }

  private async getFriendDetails(id: number) {
    const activeFriend = await this.presenceService.getActiveUser(id);

    if (!activeFriend) return;

    const friendsDetails = (await this.cache.get(
      `conversationUser ${activeFriend.id}`,
    )) as { id: number; socketId: string } | undefined;

    return friendsDetails;
  }

  @SubscribeMessage('getConversations')
  async getConversations(socket: Socket) {
    const { user } = socket.data;

    if (!user) return;

    const conversations = await this.chatService.getConversations(user.id);

    this.server.to(socket.id).emit('getAllConversations', conversations);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(socket: Socket, newMessage: NewMessageDTO) {
    if (!newMessage) return;

    const { user } = socket.data;

    if (!user) return;

    const createdMessage = await this.chatService.createMessage(
      user.id,
      newMessage,
    );

    const friendId = createdMessage.conversation.users.find(
      (u) => u.id !== user.id,
    ).id;

    const friendDetails = await this.getFriendDetails(friendId);

    if (!friendDetails) return;

    const { id, message, user: creator, conversation } = createdMessage;

    this.server.to(friendDetails.socketId).emit('newMessage', {
      id,
      message,
      creatorId: creator.id,
      conversationId: conversation.id,
    });
  }

  @SubscribeMessage('ping')
  async ping(socket: Socket) {
    console.log(`Keep socket connection alive! - socket: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`client disconnected ${socket.id}`);
  }
}
