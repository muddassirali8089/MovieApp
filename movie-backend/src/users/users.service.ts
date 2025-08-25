import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  // Profile Management Methods
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    // Check if email is being updated and if it's already taken
    if (updateProfileDto.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser && (existingUser as any)._id.toString() !== userId) {
        throw new BadRequestException('Email is already taken by another user');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    // Get user with password
    const user = await this.userModel.findById(userId).select('+password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await (user as any).correctPassword(
      changePasswordDto.currentPassword,
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password matches confirm password
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true })
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }

  async deleteAccount(userId: string, password: string): Promise<{ message: string }> {
    // Get user with password
    const user = await this.userModel.findById(userId).select('+password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify password
    const isPasswordValid = await (user as any).correctPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Delete user
    await this.userModel.findByIdAndDelete(userId).exec();
    
    return { message: 'Account deleted successfully' };
  }
}
