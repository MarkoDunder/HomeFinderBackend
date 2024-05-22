import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { ListingType } from '../models/listingType.enum';

export class CreateListingDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsNotEmpty()
  @IsEnum(ListingType)
  listingType: ListingType;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  description: string;

  //location:Location
}
