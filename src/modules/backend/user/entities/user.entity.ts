// src/modules/backend/user/entities/user.entity.ts

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Post } from "../../post/entities/post.entity";
import { Comment } from "../../comment/entities/comment.entity";
import { Reaction } from "../../reaction/entities/reaction.entity";
import { FriendRequest } from '../../friendrequest/entities/friendrequest.entity';
import { Page } from '../../pages/entities/page.entity';
import { Photo } from "../../photo/entities/photo.entity";
import { Notify } from "../../notify/entities/notify.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullname: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    phone: string;
    
   @Column({ nullable: true })
    profilepic: string;

    @Column({ nullable: true })
    coverpic: string;

    @Column({ nullable: true })
    displayname: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true })
    birthplace: string;

    @Column({ nullable: true })
    workingPlace: string;
    
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

 /*    @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
    @JoinColumn()
    auth: Auth; */


    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.author)
    comments: Comment[];

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    reactions: Reaction[];

    @OneToMany(() => FriendRequest, (fr) => fr.sender)
    sentFriendRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, (fr) => fr.receiver)
    receivedFriendRequests: FriendRequest[];

    @ManyToMany(() => Page, page => page.likedBy)
    likedPages: Page[];

    @OneToMany(() => Photo, photo => photo.user, { cascade: true })
    photos: Photo[];

    @OneToMany(() => Notify, (notify) => notify.user)
    notifications: Notify[];


}