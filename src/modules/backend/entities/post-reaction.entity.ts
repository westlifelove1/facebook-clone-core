import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: string;

  @Column()
  type: string;

  @Column()
  count: number;
}