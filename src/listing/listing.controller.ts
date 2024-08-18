import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from './models/listing.interface';
import { Observable } from 'rxjs';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateListingDTO } from './dto/createListing.dto';
import { UpdateListingDTO } from './dto/updateListing.dto';
import { AmazonS3UploadService } from 'src/auth/services/amazonS3.upload.service';
import { ListingEntity } from './models/listing.entity';

@Controller('listing')
export class ListingController {
  constructor(
    private listingService: ListingService,
    private s3Service: AmazonS3UploadService,
  ) {}

  @Get('all')
  findAllListings2(): Promise<ListingEntity[]> {
    console.error('error');
    return this.listingService.findAllListings2();
  }
  @Get('/rent')
  getRented(): Observable<ListingEntity[]> {
    return this.listingService.findRentListings();
  }

  @Get('/sale')
  getForSale(): Observable<ListingEntity[]> {
    return this.listingService.findSaleListings();
  }

  @Get(':id')
  findById(@Param('id') id: number): Observable<Listing> {
    return this.listingService.findListingById(id);
  }

  @Post(':id/soft-delete')
  async softDeleteListing(@Param('id') id: number): Promise<void> {
    try {
      await this.listingService.softDeleteListing(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  // @Roles(Role.USER, Role.ADMIN)
  // @UseGuards(JwtGuard, RolesGuard)
  // @Get('/saved')
  // findSaved(@Request() req): Observable<ListingEntity[]> {
  //   console.log('Received request');
  //   const userId: number = Number(req.user.id);
  //   return this.listingService.findSavedListingsByUser(userId);
  // }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() listing: CreateListingDTO, @Request() req): Promise<Listing> {
    return this.listingService.createListing(req.user, listing);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    const key = `listing-images/${Date.now()}-${file.originalname}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);
    return { imageUrl };
  }

  @Post('add-image-to-listing')
  async addImageToListing(
    @Body() { listingId, imageUrl }: { listingId: number; imageUrl: string },
  ) {
    return this.listingService.addUploadFileUrls(listingId, [imageUrl]);
  }

  /* @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Post(':id/update-title')
  async updateTitle(@Param('id') id: number, @Body() title: string) {
    return this.listingService.updateTitle(id, title);
  } */
  @UseGuards(JwtGuard)
  @Post('bookmark/:listingId')
  async bookmarkListing(
    @Param('listingId') listingId: number,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.id;
    return this.listingService.bookmarkListing(userId, listingId);
  }

  @UseGuards(JwtGuard)
  @Delete('bookmark-delete/:listingId')
  async unbookmarkListing(
    @Param('listingId') listingId: number,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.id;
    return this.listingService.unbookmarkListing(userId, listingId);
  }

  @UseGuards(JwtGuard)
  @Get('bookmarks/:userId')
  async getBookmarkedListings(
    @Param('userId') userId: number,
  ): Promise<ListingEntity[]> {
    console.error(`User id ; ${userId}`);
    return this.listingService.getBookmarkedListings(userId);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id/update')
  async update(
    @Param('id') id: number,
    @Body() listing: UpdateListingDTO,
  ): Promise<ListingEntity> {
    console.error('error updating');
    return this.listingService.updateListing(id, listing);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put('update2/:id')
  async update2(
    @Param('id') id: number,
    @Body() listing: CreateListingDTO,
  ): Promise<void> {
    console.error('error updating');
    return this.listingService.updateListing2(id, listing);
  }
}
