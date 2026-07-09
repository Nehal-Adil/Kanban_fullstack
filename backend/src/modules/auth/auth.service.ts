import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // register new user
  async register(registerDto: RegisterDto) {
    const { email, firstName, lastName, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    const accessToken = this.generateToken(newUser);

    return {
      accessToken,
      user: this.sanitizeUser(newUser),
    };
  }

  // login existing user
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // const user = await this.userRepository.findOne({
    //   where: { email },
    // });
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...sanitized } = user;
    return sanitized;
  }
}
