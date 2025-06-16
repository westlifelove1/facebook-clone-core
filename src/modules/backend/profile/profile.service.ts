import { Injectable,NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {

    constructor(
      @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    ) {}

  async create(createDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepo.create(createDto);
    return await this.profileRepo.save(profile);
  }

  async update(userId: number, updateDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, updateDto);
    return await this.profileRepo.save(profile);
  }

  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

}
