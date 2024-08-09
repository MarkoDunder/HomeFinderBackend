import { Injectable } from '@nestjs/common';
import { Listing } from './models/listing.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UpdateListingDTO } from './dto/updateListing.dto';
import { CreateListingDTO } from './dto/createListing.dto';
import { UserEntity } from 'src/auth/models/user.entity';
import { map } from 'rxjs';
import { CustomLocation } from 'src/location/models/location.interface';
import { User } from 'src/auth/models/user.interface';
import { CustomLocationEntity } from 'src/location/models/location.entity';
import { LocationService } from 'src/location/location.service';
@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
    @InjectRepository(CustomLocationEntity)
    private readonly locationRepository: Repository<CustomLocationEntity>,
    private locationService: LocationService,
  ) {}

  findAllListings(): Observable<Listing[]> {
    return from(
      this.listingRepository.find({ relations: ['location', 'creator'] }),
    ).pipe(map((entities) => entities.map((entity) => this.toListing(entity))));
  }

  findListingById(id: number): Observable<Listing> {
    return from(
      this.listingRepository.findOne({
        where: { id: id },
        relations: ['creator', 'location'], //relations: ['creator', 'location'],
      }),
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

  updateListing(
    id: number,
    listingDTO: UpdateListingDTO,
  ): Observable<UpdateResult> {
    return from(this.listingRepository.update(id, listingDTO));
  }

  deleteListing(id: number): Observable<DeleteResult> {
    return from(this.listingRepository.delete(id));
  }

  private calculateExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    return expiresAt;
  }

  findSavedListingsByUser(userId: number): Observable<ListingEntity[]> {
    return from(
      this.listingRepository.find({
        where: {
          isSaved: true,
          creator: {
            id: userId,
          },
        },
        relations: ['creator', 'location'],
      }),
    );
  }

  private toListing(entity: ListingEntity): Listing {
    const {
      id,
      title,
      listingType,
      price,
      description,
      isSaved,
      createdAt,
      expiresAt,
      creator,
      customLocation,
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
            isSaved: listing.isSaved,
            createdAt: listing.createdAt,
            expiresAt: listing.expiresAt,
            creator: {
              id: listing.creator.id,
              firstName: listing.creator.firstName,
              lastName: listing.creator.lastName,
              email: listing.creator.email,
              listings: [], // Provide an empty array to satisfy the User interface  -- QUESTIONABLE
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
    };

    return {
      id,
      title,
      listingType,
      price,
      description,
      isSaved,
      createdAt,
      expiresAt,
      creator: mappedCreator,
      customLocation: mappedLocation,
    };
  }
}
