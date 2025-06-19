import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { Post } from 'src/modules/backend/post/entities/post.entity';
import { ReactionType } from 'src/enums/reaction-type.enum';

@Entity('reaction')
export class Reaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ReactionType,
        default: ReactionType.LIKE
    })
    type: ReactionType;

    @ManyToOne(() => User, (user) => user.reactions)
    user: User;

    @ManyToOne(() => Post, (post) => post.reactions)
    post: Post;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
