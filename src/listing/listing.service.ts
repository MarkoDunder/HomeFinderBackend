import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Listing } from './models/listing.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { DataSource, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UpdateListingDTO } from './dto/updateListing.dto';
import { CreateListingDTO } from './dto/createListing.dto';
import { UserEntity } from 'src/auth/models/user.entity';
import { map } from 'rxjs';
import { CustomLocation } from 'src/location/models/location.interface';
import { User } from 'src/auth/models/user.interface';
import { CustomLocationEntity } from 'src/location/models/location.entity';
import { AmazonS3UploadService } from 'src/auth/services/amazonS3.upload.service';
import { ListingType } from './models/listingType.enum';
@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
    @InjectRepository(CustomLocationEntity)
    private readonly locationRepository: Repository<CustomLocationEntity>,
    private readonly s3Service: AmazonS3UploadService,
    private readonly dataSource: DataSource,
  ) {}

  findAllListings(): Observable<Listing[]> {
    return from(
      this.listingRepository.find({ relations: ['location', 'creator'] }),
    ).pipe(map((entities) => entities.map((entity) => this.toListing(entity))));
  }

  findAllListings2(): Promise<ListingEntity[]> {
    console.error('error');
    return this.listingRepository.find();
  }

  findRentListings(): Observable<ListingEntity[]> {
    return from(
      this.listingRepository.find({
        where: {
          listingType: ListingType.RENT,
          isDeleted: false,
        },
      }),
    );
  }

  findSaleListings(): Observable<ListingEntity[]> {
    return from(
      this.listingRepository.find({
        where: {
          listingType: ListingType.SALE,
          isDeleted: false,
        },
      }),
    );
  }

  findListingById(id: number): Observable<Listing> {
    return from(
      this.listingRepository.findOne(
        {
          where: { id: id, isDeleted: false },
        },
        //relations: ['creator', 'location'], //relations: ['creator', 'location'],
      ),
    );
  }

  async createListing(
    user: UserEntity,
    createListingDto: CreateListingDTO,
  ): Promise<Listing> {
    const { customLocation, ...listingData } = createListingDto;

    console.log('error here');
    const locationEntity = this.locationRepository.create({
      countryCode: customLocation.countryCode,
      city: customLocation.city,
      zipCode: customLocation.zipCode,
      streetName: customLocation.streetName,
      streetNumber: customLocation.streetNumber,
    });

    const savedLocation = await this.locationRepository.save(locationEntity);

    // Create and save the listing entity
    const listingEntity = this.listingRepository.create({
      ...listingData,
      creator: user,
      customLocation: savedLocation,
    });

    const savedListing = await this.listingRepository.save(listingEntity);

    return this.toListing(savedListing);
  }

  async addUploadFileUrls(
    listingId: number,
    imageUrls: string[],
  ): Promise<ListingEntity> {
    const listing = await this.listingRepository.findOneBy({ id: listingId });
    if (!listing) {
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }

    listing.imageUrls = [...(listing.imageUrls || []), ...imageUrls];
    return await this.listingRepository.save(listing);
  }

  async updateListing(
    id: number,
    updateListingDto: UpdateListingDTO,
  ): Promise<ListingEntity> {
    // Check if the listing exists and is not deleted
    const existingListing = await this.listingRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingListing) {
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }

    await this.listingRepository.update(id, {
      title: updateListingDto.title,
      listingType: updateListingDto.listingType,
      price: updateListingDto.price,
      description: updateListingDto.description,
      customLocation: updateListingDto.customLocation,
      imageUrls: updateListingDto.imageUrls,
    });

    // Retrieve the updated listing from the database
    const updatedListing = await this.listingRepository.findOne({
      where: { id }, // Include any relations if needed
    });

    if (!updatedListing) {
      throw new HttpException(
        'Failed to retrieve the updated listing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedListing;
  }

  async updateListing2(id: number, listingDTO: CreateListingDTO) {
    await this.listingRepository.update(id, listingDTO);
  }

  async softDeleteListing(id: number): Promise<void> {
    // Check if the listing exists
    const listing = await this.listingRepository.findOne({
      where: { id },
    });

    if (!listing) {
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }

    // Update the isDeleted flag
    const result = await this.listingRepository.update(id, { isDeleted: true });

    if (result.affected === 0) {
      throw new HttpException(
        'Failed to mark listing as deleted',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    console.log(`Listing with ID ${id} marked as deleted`);
  }

  async updateTitle(id: number, title: string): Promise<void> {
    const listing = await this.listingRepository.findOne({
      where: { id },
    });

    if (!listing) {
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.listingRepository.save({
      id,
      title,
    });

    console.log(`Listing with ID ${id} was updated`);
  }

  private calculateExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    return expiresAt;
  }

  private toListing(entity: ListingEntity): Listing {
    const {
      id,
      title,
      listingType,
      price,
      description,
      createdAt,
      expiresAt,
      creator,
      customLocation,
      imageUrls,
      isDeleted,
    } = entity;

    const mappedLocation: CustomLocation = {
      id: customLocation.id,
      countryCode: customLocation.countryCode,
      city: customLocation.city,
      zipCode: customLocation.zipCode,
      streetName: customLocation.streetName,
      streetNumber: customLocation.streetNumber,
    };

    const mappedCreator: User = {
      id: creator.id,
      firstName: creator.firstName,
      lastName: creator.lastName,
      email: creator.email,
      listings: creator.listings
        ? creator.listings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            description: listing.description,
            listingType: listing.listingType,
            createdAt: listing.createdAt,
            expiresAt: listing.expiresAt,
            isDeleted: listing.isDeleted,
            imageUrls: listing.imageUrls,
            creator: {
              id: listing.creator.id,
              firstName: listing.creator.firstName,
              lastName: listing.creator.lastName,
              email: listing.creator.email,
              listings: [], // Provide an empty array to satisfy the User interface  -- QUESTIONABLE
              friendRequestCreator: [],
              friendRequestReceiver: [],
              conversations: [],
              messages: [],
            },
            customLocation: listing.customLocation
              ? {
                  id: listing.customLocation.id,
                  countryCode: listing.customLocation.countryCode,
                  city: listing.customLocation.city,
                  zipCode: listing.customLocation.zipCode,
                  streetName: listing.customLocation.streetName,
                  streetNumber: listing.customLocation.streetNumber,
                }
              : null,
          }))
        : [],
      friendRequestCreator: creator.friendRequestCreator || [], // Populate with actual data or default to empty array
      friendRequestReceiver: creator.friendRequestReceiver || [], // Populate with actual data or default to empty array
      conversations: creator.conversations || [], // Populate with actual data or default to empty array
      messages: creator.messages || [], // Populate with actual data or default to empty array
    };
    return {
      id,
      title,
      listingType,
      price,
      description,
      createdAt,
      expiresAt,
      creator: mappedCreator,
      customLocation: mappedLocation,
      imageUrls,
      isDeleted,
    };
  }
}
