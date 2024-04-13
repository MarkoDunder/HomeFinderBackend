import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from './models/listing.interface';
import { Observable } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() listing: Listing, @Request() req): Observable<Listing> {
    return this.listingService.createListing(req.user, listing);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() listing: Listing,
  ): Observable<UpdateResult> {
    return this.listingService.updateListing(id, listing);
  }
}
