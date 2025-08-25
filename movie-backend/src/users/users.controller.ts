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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
    private readonly cloudinaryService: CloudinaryService,
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
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.updateProfile(req.user._id, updateProfileDto);
  }

  @Patch('updateProfileImage')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload image to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'users');
      
      // Update user profile with the new image URL
      return this.usersService.updateProfileImage(req.user._id, imageUrl);
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  @Patch('changePassword')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.changePassword(req.user._id, changePasswordDto);
  }

  @Delete('deleteAccount')
  @UseGuards(JwtAuthGuard)
  deleteAccount(
    @Body() body: { password: string },
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.deleteAccount(req.user._id, body.password);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
