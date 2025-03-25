import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateUserDetails,
  FindUserOptions,
  FindUserParams,
} from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';
import { IuserServices } from '../interfaces/user';

@Injectable()
export class UserServices implements IuserServices {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * // createUser
   * @param userDetails
   * @returns
   */
  async createUser(userDetails: CreateUserDetails): Promise<User> {
    const userExist = await this.userRepository.findOne({
      where: { username: userDetails.username },
    });
    if (userExist)
      throw new HttpException(
        'User already exists with the username',
        HttpStatus.CONFLICT,
      );

    const password = await hashPassword(userDetails.password);
    const newUser = this.userRepository.create({ ...userDetails, password });
    const saveUser = await this.userRepository.save(newUser);
    return saveUser;
  }

  /**
   * // findUser
   * @param findUserParams
   * @param options
   * @returns
   */
  async findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User> {
    const selections: (keyof User)[] = [
      'username',
      'lastName',
      'firstName',
      'id',
    ];

    const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];

    const user = await this.userRepository.findOne({
      where: findUserParams,
      select: options?.selectAll ? selectionsWithPassword : selections,
    });

    return user;
  }

  /**
   * search user
   * @param query: string
   */
  async searchUsers(query: string): Promise<User[]> {
    const statement =
      '(user.firstName LIKE :query OR user.username LIKE :query OR user.lastName LIKE :query)';

    return this.userRepository
      .createQueryBuilder('user')
      .where(statement, { query: `%${query}%` })
      .limit(10)
      .addSelect([
        'user.lastName',
        'user.firstName',
        'user.username',
        'user.id',
        'user.profile',
      ])
      .getMany();
  }
}
