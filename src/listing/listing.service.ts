import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/models/user.interface';
import { Listing } from './models/listing.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from './models/listing.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UpdateListingDTO } from './dto/updateListing.dto';
import { CreateListingDTO } from './dto/createListing.dto';

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
        relations: ['creator'],
      }),
    );
  }

  createListing(user: User, listingDTO: CreateListingDTO): Observable<Listing> {
    // Save the listing to the database
    return from(this.listingRepository.save({ ...listingDTO, creator: user }));
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
}
