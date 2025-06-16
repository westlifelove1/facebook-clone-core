import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from  '../../user/entities/user.entity';

@Entity('friendrequests')
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'accept', 'reject'],
    default: 'pending',
  })
  status: 'pending' | 'accept' | 'reject';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    @ManyToOne(() => User, (user) => user.sentFriendRequests)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
