import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from './models/listing.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { ListingEntity } from './models/listing.entity';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Get('/')
  findAll(): Observable<Listing[]> {
    return this.listingService.findAllListings();
  }

  @Get(':id')
  findById(@Param('id') id: number): Observable<Listing> {
    return this.listingService.findListingById(id);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('/saved')
  findSaved(@Request() req): Observable<ListingEntity[]> {
    console.log('Received request');
    const userId: number = Number(req.user.id);
    return this.listingService.findSavedListingsByUser(userId);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() listing: Listing, @Request() req): Observable<Listing> {
    return this.listingService.createListing(req.user, listing);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() listing: Listing,
  ): Observable<UpdateResult> {
    return this.listingService.updateListing(id, listing);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.listingService.deleteListing(id);
  }
}
