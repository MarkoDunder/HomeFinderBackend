import { Injectable } from '@nestjs/common';
import { Listing } from './models/listing.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UpdateListingDTO } from './dto/updateListing.dto';
import { CreateListingDTO } from './dto/createListing.dto';
import { UserEntity } from 'src/auth/models/user.entity';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
  ) {}

  findAllListings(): Observable<Listing[]> {
    return from(this.listingRepository.find());
  }

  findListingById(id: number): Observable<Listing> {
    return from(
      this.listingRepository.findOne({
        where: { id: id },
        relations: ['creator'], //relations: ['creator', 'location'],
      }),
    );
  }

  createListing(
    user: UserEntity,
    listingDTO: CreateListingDTO,
  ): Observable<ListingEntity> {
    const listing = this.listingRepository.create(listingDTO);
    listing.creator = user;
    listing.expiresAt = this.calculateExpirationDate();

    return from(this.listingRepository.save(listing));
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
        relations: ['creator'],
      }),
    );
  }
}
