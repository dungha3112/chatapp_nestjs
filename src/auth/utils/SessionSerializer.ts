import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { IuserServices } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { User } from 'src/utils/typeorm';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(Services.USERS) private readonly userService: IuserServices,
  ) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user);
  }

  async deserializeUser(user: User, done: Function) {
    const userDb = await this.userService.findUser({ id: user.id });

    console.log(`deserialize User`);

    return userDb ? done(null, user) : done(null, null);
  }
}
