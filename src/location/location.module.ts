import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LocationController } from './location.controller';
import { LocationEntity } from './models/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity]), HttpModule],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
