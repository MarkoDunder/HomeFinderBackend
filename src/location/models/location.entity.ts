import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('custom_location')
export class CustomLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryCode: string;

  @Column()
  city: string;

  @Column({ default: '10000' })
  zipCode: string;
}
