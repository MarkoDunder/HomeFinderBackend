import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/models/user.interface';
import { Listing } from './models/listing.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
  ) {}

  /* findAllListings(): Observable<Listing[]> {
    return from(this.listingRepository.find());
  } */

  createListing(user: User, listing: Listing): Observable<Listing> {
    listing.creator = user;
    return from(this.listingRepository.save(listing));
  }

  updateListing(id: number, listing: Listing): Observable<UpdateResult> {
    return from(this.listingRepository.update(id, listing));
  }

  deleteListing(id: number): Observable<DeleteResult> {
    return from(this.listingRepository.delete(id));
  }
}
