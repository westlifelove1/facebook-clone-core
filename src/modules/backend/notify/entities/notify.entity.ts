import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@Entity('notify')
export class Notify {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    user: User;

    
    @ManyToOne(() => Post, (post) => post.notifications, { onDelete: 'CASCADE' })
    post: Post;
} 