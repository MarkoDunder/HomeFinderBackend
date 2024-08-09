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

  @Column({ default: 'Radnicka cesta' })
  streetName: string;

  @Column({ default: '1' })
  streetNumber: string;
}
