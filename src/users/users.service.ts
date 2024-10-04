import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IuserServices } from './user';
import { CreateUserDetails, LoginUserDetails } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';

@Injectable()
export class UsersService implements IuserServices {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDetails: CreateUserDetails): Promise<User> {
    const userExist = await this.userRepository.findOne({
      where: { email: userDetails.email },
    });
    if (userExist)
      throw new HttpException(
        'User already exists with the email',
        HttpStatus.CONFLICT,
      );

    const password = await hashPassword(userDetails.password);
    const newUser = this.userRepository.create({ ...userDetails, password });
    const saveUser = await this.userRepository.save(newUser);
    return saveUser;
  }

  async loginUser(userDetails: LoginUserDetails) {
    throw new Error('Method not implemented.');
  }
}
