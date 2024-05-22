import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LocationService {
  private readonly apiUrl = 'https://api.countrystatecity.in/v1';
  private readonly apiKey = process.env.COUNTRY_STATE_CITY_API_KEY;

  constructor(private httpService: HttpService) {}

  getCountries(): Observable<any> {
    const url = `${this.apiUrl}/countries`;
    return this.httpService
      .get(url, {
        headers: { 'X-CSCAPI-KEY': this.apiKey },
      })
      .pipe(map((response) => response.data));
  }

  getCitiesByCountry(country: string): Observable<any> {
    const url = `${this.apiUrl}/countries/${country}/cities`;
    return this.httpService
      .get(url, {
        headers: { 'X-CSCAPI-KEY': this.apiKey },
      })
      .pipe(map((response) => response.data));
  }
}
