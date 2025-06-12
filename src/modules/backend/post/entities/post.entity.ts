import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { Comment } from 'src/modules/backend/comment/entities/comment.entity';
import { Reaction } from 'src/modules/backend/reaction/entities/reaction.entity';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('smallint', { default: 0 })
    isType: number; // 0: public, 1: friends, 2: only me

    @Column('text')
    content: string;

    @Column('json', { nullable: true })
    mediaUrl: Record<string, any>; // or just `any`


    @Column('json', { nullable: true })
    friends: Record<string, any>; 

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => Reaction, reaction => reaction.post)
    reactions: Reaction[];
  userId: number;

    
} 