import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  content: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'file'], { message: 'Invalid message type' })
  messageType?: 'text' | 'image' | 'file';

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
