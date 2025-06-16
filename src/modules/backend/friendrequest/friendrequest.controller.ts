import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FriendrequestService } from './friendrequest.service';
import { CreateFriendrequestDto } from './dto/create-friendrequest.dto';
import { UpdateFriendrequestDto } from './dto/update-friendrequest.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Backend/friendrequest')
@Controller('friendrequest')
export class FriendrequestController {
  constructor(private readonly friendrequestService: FriendrequestService) {}

  @Post('send/:senderId/:receiverId')
  sendRequest(@Param('senderId') senderId: number, @Param('receiverId') receiverId: number) {
    return this.friendrequestService.sendRequest(senderId, receiverId);
  }

  @Post('respond/:id')
  respondToRequest(@Param('id') id: number, @Body('status') status: 'accept' | 'reject') {
    return this.friendrequestService.respondRequest(id, status);
  }

  @Post()
  create(@Body() createFriendrequestDto: CreateFriendrequestDto) {
    return this.friendrequestService.create(createFriendrequestDto);
  }

  @Get('friends/:userId')
  getFriends(@Param('userId') userId: number) {
    return this.friendrequestService.getFriendList(userId);
  }
}
