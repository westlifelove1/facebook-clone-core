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

    @Column('text')
    content: string;

    @Column({ nullable: true })
    mediaUrl: string;

    @ManyToOne(() => User, user => user.posts)
    author: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => Reaction, reaction => reaction.post)
    reactions: Reaction[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 