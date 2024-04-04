import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ListingEntity])],
  providers: [ListingService],
  controllers: [ListingController],
})
export class ListingModule {}
