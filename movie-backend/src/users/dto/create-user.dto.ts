export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  profileImage?: string;
  dateOfBirth?: Date;
}
