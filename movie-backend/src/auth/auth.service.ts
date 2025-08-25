/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as validator from 'validator';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password, confirmPassword, address } = signupDto;
    console.log(name, email, password, confirmPassword, address);

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      throw new BadRequestException(
        'Name, email, password, and confirmPassword are required',
      );
    }
    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    // Create user
    const newUser = await this.usersService.create({
      name,
      email,
      password,
      confirmPassword,
      address,
    });

    // Generate JWT token
    const token = this.jwtService.sign({ id: (newUser as any)._id });

    // Remove password from response
    const userObj = (newUser as any).toObject();
    const {
      password: _password,
      confirmPassword: _confirmPassword,
      ...userWithoutPassword
    } = userObj;

    return {
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Check if email and password exist
    if (!email || !password) {
      throw new BadRequestException('Please provide email and password!');
    }

    // Check if user exists && password is correct
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    // Check if password is correct
    const isPasswordValid = await (user as any).correctPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ id: (user as any)._id });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userObj = (user as any).toObject();
    const {
      password: _password,
      confirmPassword: _confirmPassword,
      ...userWithoutPassword
    } = userObj;

    return {
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    };
  }
}
