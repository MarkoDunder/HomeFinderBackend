import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { ListingType } from '../models/listingType.enum';
import { CustomLocation } from 'src/location/models/location.interface';

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
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  customLocation: CustomLocation;

  imagePaths: string[];
}
