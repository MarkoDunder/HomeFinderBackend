import { UserEntity } from 'src/auth/models/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ListingType } from './listingType.enum';

@Entity('listing')
export class ListingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  listingType: ListingType;

  @Column()
  price: number;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.listings)
  creator: UserEntity;

  @BeforeInsert()
  calculateExpiresAt(): void {
    const expiresAt = new Date();
    expiresAt.setDate(this.createdAt.getDate() + 90);
    this.expiresAt = expiresAt;
  }
}
