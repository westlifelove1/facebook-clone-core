import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { Post } from 'src/modules/backend/post/entities/post.entity';

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @ManyToOne(() => User, user => user.comments)
    author: User;

    @ManyToOne(() => Post, post => post.comments,  { onDelete: 'CASCADE' })
    post: Post;

    @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
    parentComment: Comment;

    @OneToMany(() => Comment, comment => comment.parentComment)
    replies: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
