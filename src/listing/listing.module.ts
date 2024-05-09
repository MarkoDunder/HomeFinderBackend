import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { AuthModule } from 'src/auth/auth.module';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  imports: [
    AuthModule,
    IsCreatorGuard,
    TypeOrmModule.forFeature([ListingEntity]),
  ],
  providers: [ListingService],
  controllers: [ListingController],
})
export class ListingModule {}
