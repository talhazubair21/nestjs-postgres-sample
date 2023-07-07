import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignupDto } from '../auth/dto/signup.dto';
import { Users } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async createUser(createUserDto: SignupDto): Promise<Users> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
  async remove(email: string) {
    const user = await this.userRepository.delete({ email });
    if (user.affected === 0) {
      throw new NotFoundException(`User not found`);
    }
    return 'User Deleted Successfully';
  }
  async findByEmail(email: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }
  async findById(id: number): Promise<Users | undefined> {
    return this.userRepository.findOneBy({ id });
  }
}
