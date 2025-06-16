import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
@Unique(['userId'])
export class Profile {
  @PrimaryGeneratedColumn()
  profileId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  profilePic: string;

  @Column()
  displayName: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], default: 'other' })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}