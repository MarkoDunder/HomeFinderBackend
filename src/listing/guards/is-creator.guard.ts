import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { ListingService } from '../listing.service';
import { User } from 'src/auth/models/user.interface';
import { Listing } from '../../../dist/listing/models/listing.interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private listingService: ListingService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return false;

    if (user.role === 'admin') return true;

    const userId = user.id;
    const listingId = params.id;

    return this.authService.findUserById(userId).pipe(
      switchMap((user: User) =>
        this.listingService.findListingById(listingId).pipe(
          map((listing: Listing) => {
            const isCreator = user.id === listing.creator.id;
            return isCreator;
          }),
        ),
      ),
    );
  }
}
