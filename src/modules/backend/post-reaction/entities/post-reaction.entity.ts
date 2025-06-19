import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: string;

  @Column()
  type: string; // like, heart, etc.

  @Column()
  count: number;
}