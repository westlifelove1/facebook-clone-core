// src/modules/backend/user/entities/user.entity.ts

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Auth } from 'src/modules/backend/auth/entities/auth.entity';
import { Post } from "../../post/entities/post.entity";
import { Comment } from "../../comment/entities/comment.entity";
import { Reaction } from "../../reaction/entities/reaction.entity";
import { Profile } from '../../profile/entities/profile.entity';
import { FriendRequest } from '../../friendrequest/entities/friendrequest.entity';
import { Photo } from "../../photo/entities/photo.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    phone: string;
    
    @Column()
    avatar: string;

    @Column({
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
    })
    updatedAt: Date;

    @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
    @JoinColumn()
    auth: Auth;


    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.author)
    comments: Comment[];

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    reactions: Reaction[];

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile;

    @OneToMany(() => FriendRequest, (fr) => fr.sender)
    sentFriendRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, (fr) => fr.receiver)
    receivedFriendRequests: FriendRequest[];

    @OneToMany(() => Photo, photo => photo.user, { cascade: true })
    photos: Photo[];
}