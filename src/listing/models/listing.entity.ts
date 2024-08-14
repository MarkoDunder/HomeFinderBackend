import { UserEntity } from 'src/auth/models/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ListingType } from './listingType.enum';
import { CustomLocationEntity } from 'src/location/models/location.entity';

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

  @Column({ nullable: true })
  expiresAt: Date;

  @OneToOne(() => CustomLocationEntity)
  @JoinColumn()
  customLocation: CustomLocationEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.listings)
  creator: UserEntity;
}
