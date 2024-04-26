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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
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
