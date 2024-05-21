import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('location')
export class LocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('countryCode')
  countryCode: string;

  @Column('city')
  city: string;
}
