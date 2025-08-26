import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsMongoId({ message: 'Invalid participant ID' })
  @IsNotEmpty({ message: 'Participant ID is required' })
  participantId: string;
}
