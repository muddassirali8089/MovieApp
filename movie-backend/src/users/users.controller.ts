import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RatingsService } from '../ratings/ratings.service';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { SignupDto } from '../auth/dto/signup.dto';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ratingsService: RatingsService,
    private readonly authService: AuthService,
  ) {}

  // Auth routes (moved from auth controller to match Node.js structure)
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // User management routes
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Profile routes (matching Node.js exactly) - MUST come before :id route
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return this.usersService.findOne(req.user._id);
  }

  @Patch('updateProfile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.update(req.user._id, updateUserDto);
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  getMyRatings(@Request() req: RequestWithUser) {
    return this.ratingsService.findByUser(req.user._id);
  }

  // Parameterized routes - MUST come after specific routes
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
