// src/businesses/dto/upload-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  constructor(partial: Partial<UploadImageResponseDto>) {
    Object.assign(this, partial);
  }
}
