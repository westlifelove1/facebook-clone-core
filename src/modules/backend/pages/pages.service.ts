import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from './entities/page.entity';
import { User } from '../user/entities/user.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class PagesService {

   constructor(
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: CreatePageDto) {
    const page = this.pageRepo.create(dto);
    return this.pageRepo.save(page);
  }

  async likePage(pageId: number, userId: number) {
    const page = await this.pageRepo.findOne({ where: { id: pageId }, relations: ['likedBy'] });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!page || !user) throw new NotFoundException();

    page.likedBy.push(user);
    return this.pageRepo.save(page);
  }

  async unlikePage(pageId: number, userId: number) {
    const page = await this.pageRepo.findOne({ where: { id: pageId }, relations: ['likedBy'] });
    if (!page) throw new NotFoundException();

    page.likedBy = page.likedBy.filter(u => u.id !== userId);
    return this.pageRepo.save(page);
  }

  async getLikedPages(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['likedPages'] });
    return user?.likedPages || [];
  }

  async getSuggestedPages(userId: number) {
    const likedPages = await this.getLikedPages(userId);
    const likedIds = likedPages.map(p => p.id);

    return this.pageRepo.find({
      where: likedIds.length > 0 ? { id: Not(In(likedIds)) } : {},
      take: 10,
    });
  }
}
