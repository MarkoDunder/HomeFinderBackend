import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { Observable } from 'rxjs';

@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('/countries')
  getAllCountries(): Observable<any> {
    return this.locationService.getCountries();
  }

  @Get('/countries/:countryCode/cities')
  getCitiesByCountry(
    @Param('countryCode') countryCode: string,
  ): Observable<any> {
    return this.locationService.getCitiesByCountry(countryCode);
  }
}
