import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';

export class RespondFriendRequestDto {
  @ApiProperty({ enum: ['accept', 'reject'], description: 'Response to the request', example: 'accept' })
  @IsIn(['accept', 'reject'])
  status: 'accept' | 'reject';

  @ApiProperty({ description: 'ID of the user who sent the friend request', example: 123 })
  @IsNumber()
  senderId: number;
}