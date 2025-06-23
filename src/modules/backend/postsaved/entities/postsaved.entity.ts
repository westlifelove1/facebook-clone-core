import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Post } from 'src/modules/backend/post/entities/post.entity';
import { User } from 'src/modules/backend/user/entities/user.entity';

@Entity('postsaved')
export class PostSaved {
    @PrimaryColumn()
    userId: number;


    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Post;
    
    @UpdateDateColumn()
    updatedAt: Date;

}
