import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PublicationService } from './publication.service';

@Controller('courses')
export class PublicationController {
  constructor(private readonly publication: PublicationService) {}

  @Post(':id/submit-review')
  submitReview(@Param('id', ParseIntPipe) id: number) {
    return this.publication.submitReview(id);
  }

  @Post(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.publication.publish(id);
  }
}
