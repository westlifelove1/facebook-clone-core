import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn,  ManyToMany, JoinTable } from "typeorm";
import { User } from '../../user/entities/user.entity';

@Entity()
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  pagePicture: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, user => user.likedPages)
  @JoinTable()
  likedBy: User[];
}
