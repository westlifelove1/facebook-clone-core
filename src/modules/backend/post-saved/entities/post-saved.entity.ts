import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Post } from 'src/modules/backend/post/entities/post.entity';
import { User } from 'src/modules/backend/user/entities/user.entity';

@Entity('reaction')
export class PostSaved {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reactions)
    user: User;

    @ManyToOne(() => Post, (post) => post.reactions)
    post: Post;

    

}
