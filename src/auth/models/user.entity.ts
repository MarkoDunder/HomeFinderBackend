import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.enum';
import { ListingEntity } from 'src/listing/models/listing.entity';
import { FriendRequestEntity } from './friend-request.entity';
import { ConversationEntity } from 'src/chat/model/conversation.entity';
import { MessageEntity } from 'src/chat/model/message.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => ListingEntity, (listingEntity) => listingEntity.creator)
  listings: ListingEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.creator,
  )
  friendRequestCreator: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (FriendRequestEntity) => FriendRequestEntity.receiver,
  )
  friendRequestReceiver: FriendRequestEntity[];

  @ManyToMany(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.users,
  )
  conversations: ConversationEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages: MessageEntity[];
}
