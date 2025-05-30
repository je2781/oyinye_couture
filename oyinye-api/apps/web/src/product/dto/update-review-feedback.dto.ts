import { IsNumber, IsString } from 'class-validator';

export class UpdateReviewFeedbackDto {
  @IsNumber()
  likes: number;

  @IsNumber()
  dislikes: number;

  @IsString()
  reviewId: string;
}
