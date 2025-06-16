import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Post } from 'src/modules/backend/post/entities/post.entity';

@Entity('photo')
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('smallint', { default: 0 })
    isType: number; // 0: image, 1: video

    @Column()
    name: string;

    @Column('text')
    url: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Post, post => post.photos)
    post: Post;
        
} 