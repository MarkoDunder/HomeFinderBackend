import {
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Res,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Observable, from, of, switchMap } from 'rxjs';
import { JwtGuard } from '../guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  isFileExtensionSafe,
  removeFile,
  saveImageToStorage,
} from '../helpers/image.storage';
import { join } from 'path';
import { UpdateResult } from 'typeorm';
import { User } from '../models/user.interface';
import { FriendRequest } from '../models/friend-request.interface';
import { FriendRequestStatus } from '../models/friend-request.interface';
import { FriendRequest_Status } from '../models/friend-request.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Observable<UpdateResult | { error: string }> {
    const fileName = file?.filename;

    if (!fileName)
      return of({ error: 'File must be of type: png, jpg or jpeg' });

    const imageFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imageFolderPath + '/' + file.filename);

    return from(isFileExtensionSafe(fullImagePath)).pipe(
      switchMap((isFileLegit: boolean) => {
        if (isFileLegit) {
          const userId = req.user.id;
          return this.userService.updateUserImageById(userId, fileName);
        }

        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension' });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<any> {
    // used any observable instead of object observable
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: '/images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userStringId: string): Observable<User> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  sendConnectionRequest(
    @Param('receiverId') receiverStringId: string,
    @Request() req,
  ): Observable<FriendRequest | { error: string }> {
    const receiverId = parseInt(receiverStringId);
    return this.userService.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId') receiverStringId: string,
    @Request() req,
  ): Observable<FriendRequestStatus> {
    const receiverId = parseInt(receiverStringId);
    return this.userService.getFriendRequestStatus(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/respond/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId') friendRequestStringId: string,
    @Body('status') statusResponse: FriendRequest_Status,
  ): Observable<FriendRequestStatus> {
    const friendRequestId = parseInt(friendRequestStringId);
    return this.userService.respondToFriendRequest(
      statusResponse,
      friendRequestId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestsFromRecipients(
    @Request() req,
  ): Observable<FriendRequestStatus[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friends/my')
  getFriends(@Request() req): Observable<User[]> {
    return this.userService.getFriends(req.user);
  }
}
