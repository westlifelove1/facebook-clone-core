import { Controller, Get, Post, Body,  Param, Delete,UseGuards, Request } from '@nestjs/common';
import { FriendrequestService } from './friendrequest.service';
import { RespondFriendRequestDto } from './dto/respond-friendrequest.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';

@ApiTags('Backend/friendrequest')
@ApiBearerAuth('access_token') 
@UseGuards(AuthGuard)
@Controller()
export class FriendrequestController {
  constructor(private readonly friendrequestService: FriendrequestService) {}

  @Post('send/:senderId/:receiverId')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest( @Param('receiverId') receiverId: number,  @Request() req,) {
    const senderId = req.user.id; 
    return this.friendrequestService.sendRequest(senderId, receiverId);
  }

  @Post('respond')
  @ApiOperation({ summary: 'Respond to a friend request' })
  respondToRequest( @Body() dto: RespondFriendRequestDto, @Request() req,) {
    const receiverId = req.user.id; 
    return this.friendrequestService.respondRequest(dto.senderId, receiverId, dto.status);
  }

  @Delete('unfriend/:userId/:friendId')
  @ApiOperation({ summary: 'Remove a friend from friend list' })
  unfriend(@Param('userId') userId: number,  @Param('friendId') friendId: number, ) {
    return this.friendrequestService.unfriend(userId, friendId);
  }

  @Get('friends/:userId')
  @ApiOperation({ summary: 'Get friend list of a user' })
  getFriends(@Param('userId') userId: number) {
    return this.friendrequestService.getFriendList(userId);
  }
}
