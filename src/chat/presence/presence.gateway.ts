import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { RedisCacheService } from 'src/redis.cache.service';
import { Server, Socket } from 'socket.io';
import { ActiveUser } from './interfaces/ActiveUser.interface';
import { UserService } from 'src/auth/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserJwt } from './interfaces/UserJwt.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly cache: RedisCacheService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  /* private async getFriends(userId: number) {
    const userObservable = this.userService.findUserById(userId);
    const user = await firstValueFrom(userObservable);
    const friends = this.userService.getFriends(userObservable);
    return await firstValueFrom(friends);
  }

  private async emitStatusToFriends(activeUser: ActiveUser) {
    const friends = await this.getFriends(activeUser.id);

    for (const f of friends) {
      const user = await this.cache.get(`user ${f.id}`);

      if (!user) continue;

      const friend = user as ActiveUser;

      this.server.to(friend.socketId).emit('friendActive', {
        id: activeUser.id,
        isActive: activeUser.isActive,
      });

      if (activeUser.isActive) {
        this.server.to(activeUser.socketId).emit('friendActive', {
          id: friend.id,
          isActive: friend.isActive,
        });
      }
    }
  } */

  private async setActiveStatus(socket: Socket, isActive: boolean) {
    const user = socket.data?.user;
    console.log(user);

    if (!user) return;

    const activeUser: ActiveUser = {
      id: user.id,
      socketId: socket.id,
      isActive,
    };

    await this.cache.set(`user ${user.id}`, activeUser);
    //await this.emitStatusToFriends(activeUser);
  }

  async handleDisconnect(socket: Socket) {
    console.log('HANDLE DISCONNECT');

    await this.setActiveStatus(socket, false);
  }

  async handleConnection(socket: Socket) {
    console.log('HANDLE CONNECTION');

    const jwt = socket.handshake.headers.authorization ?? null;

    if (!jwt) {
      this.handleDisconnect(socket);
      return;
    }

    try {
      // Decode the JWT into a UserJwt object
      const decodedToken = await this.jwtService.verifyAsync<UserJwt>(jwt);

      if (!decodedToken || !decodedToken.id) {
        // Ensure the essential fields exist
        this.handleDisconnect(socket);
        return;
      }

      // Store the user data in the socket's data object
      socket.data.user = decodedToken;

      // Set the user's active status
      await this.setActiveStatus(socket, true);
    } catch (err) {
      console.error('JWT verification failed:', err);
      this.handleDisconnect(socket);
    }
  }

  @SubscribeMessage('updateActiveStatus')
  async updateActiveStatus(socket: Socket, isActive: boolean) {
    if (!socket.data?.user) return;

    await this.setActiveStatus(socket, isActive);
  }
}
