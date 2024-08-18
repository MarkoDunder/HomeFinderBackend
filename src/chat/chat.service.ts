import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './model/conversation.entity';
import { MessageEntity } from './model/message.entity';
import { UserService } from 'src/auth/services/user.service';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { NewMessageDTO } from './dto/NewMessageDTO';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private userService: UserService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  private async getUser(id: number) {
    const ob$ = this.userService.findUserById(id);
    const user = await firstValueFrom(ob$).catch((err) => console.error(err));

    return user;
  }

  async getConversations(userId: number) {
    const allConversations = await this.conversationRepository.find({
      relations: ['users'],
    });

    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });

    return userConversations.map((conversation) => {
      id: conversation.id;
      userIds: conversation.users.map((user) => user.id);
    });
  }

  async createConversation(userId: number, friendId: number) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);

    if (!user || !friend) return;

    const conversation = this.findConversation(userId, friendId);

    if (!conversation) {
      return await this.conversationRepository.save({
        users: [user, friend],
      });
    }

    return conversation;
  }

  async createMessage(userId: number, newMessage: NewMessageDTO) {
    const user = await this.getUser(userId);

    if (!user) return;

    const conversation = await this.conversationRepository.findOne({
      where: { id: newMessage.conversationId },
      relations: ['users'],
    });

    if (!conversation) return;

    return await this.messageRepository.save({
      message: newMessage.message,
      user,
      conversation,
    });
  }

  public async findConversation(
    userId: number,
    friendId: number,
  ): Promise<ConversationEntity | undefined> {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.users', 'user')
      .where('user.id IN (:...userIds)', { userIds: [userId, friendId] })
      .groupBy('conversation.id')
      .having('COUNT(user.id) = 2')
      .getOne();
  }
}
