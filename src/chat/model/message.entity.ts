import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/auth/models/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('message')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.messages)
  user: UserEntity;

  @ManyToOne(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.messages,
  )
  conversation: ConversationEntity;

  @CreateDateColumn()
  createdAt: Date;
}
