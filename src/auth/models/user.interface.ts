import { Listing } from 'src/listing/models/listing.interface';
import { Role } from './role.enum';
import { FriendRequestEntity } from './friend-request.entity';
import { ConversationEntity } from 'src/chat/model/conversation.entity';
import { MessageEntity } from 'src/chat/model/message.entity';

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  imagePath?: string;
  role?: Role;
  listings: Listing[];
  friendRequestCreator: FriendRequestEntity[];
  friendRequestReceiver: FriendRequestEntity[];
  conversations: ConversationEntity[];
  messages: MessageEntity[];
}
