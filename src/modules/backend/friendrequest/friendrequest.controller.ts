import { Controller, Get, Post, Body, Query, Param, Delete,UseGuards, Request ,UnauthorizedException} from '@nestjs/common';
import { FriendrequestService } from './friendrequest.service';
import { RespondFriendRequestDto } from './dto/respond-friendrequest.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody,ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';

@ApiTags('Backend/friendrequest')
@ApiBearerAuth('access_token') 
@UseGuards(AuthGuard)
@Controller()
export class FriendrequestController {
  constructor(private readonly friendrequestService: FriendrequestService) {}

  @Post('/:receiverId')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest( @Param('receiverId') receiverId: number,  @Request() req,) {
    const senderId = req.user.id; 
    return this.friendrequestService.sendRequest(senderId, receiverId);
  }

  @Post('respond')
  @ApiOperation({ summary: 'Respond to a friend request (accept or reject)' })
  respondToRequest( @Body() dto: RespondFriendRequestDto, @Request() req,) {
    const receiverId = req.user.id; 
    return this.friendrequestService.respondRequest(dto.senderId, receiverId, dto.status);
  }

  @Delete('unfriend/:userId/:friendId')
  @ApiOperation({ summary: 'Remove a friend from friend list' })
  unfriend(@Param('userId') userId: number,  @Param('friendId') friendId: number, ) {
    return this.friendrequestService.cancelOrUnfriend(userId, friendId);
  }

  @Get('friends/:userId')
  @ApiOperation({ summary: 'Get friend list of a user' })
  getFriends(@Param('userId') userId: number) {
    return this.friendrequestService.getFriendList(userId);
  }

  @Get('pending/:userId')
  @ApiOperation({ summary: 'Get pending friend request list of a user' })
  getPendingRequests(@Param('userId') userId: number) {
    return this.friendrequestService.getPendingRequests(userId);
  }

  @Get('friendstatus/:otherUserId')
  @ApiOperation({ summary: 'check friend status of a user' })
  async checkFriendStatus(@Request() req, @Param('otherUserId') otherId: number) {
    const userId = req.user.id;
    const status = await this.friendrequestService.getFriendStatus(userId, otherId);
    return { status }; // ví dụ: { status: 1 }
  }

   @Get('friends/suggestions')
    @ApiOperation({ summary: 'Get friend suggestions' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getSuggestions(  @Request() req,  @Query('page') page = 1,  @Query('limit') limit = 10, ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.friendrequestService.friendSuggestion(+userId, +page, +limit);;
  }

}
