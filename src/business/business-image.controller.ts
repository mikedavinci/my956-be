// src/businesses/controllers/business-image.controller.ts

// usage in frontend
// For profile images
// const formData = new FormData();
// formData.append('file', data.image);
// const imageResponse = await axios.post('/api/business-images/upload/profile', formData, {
//   headers: {
//     'Content-Type': 'multipart/form-data',
//   },
// });

// // For static images
// const formData = new FormData();
// formData.append('file', data.image);
// const imageResponse = await axios.post('/api/business-images/upload/static', formData, {
//   headers: {
//     'Content-Type': 'multipart/form-data',
//   },
// });

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessImageService } from './business-image.service';
import { UploadImageResponseDto } from './dto/upload-image.dto';
import { Express } from 'express';
import { ImageType } from './enums/image-type.enum';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Business Images')
@Controller('business-images')
export class BusinessImageController {
  constructor(
    private readonly businessImageService: BusinessImageService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: 'Test S3 connection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'S3 connection successful',
  })
  @Public()
  @Get('test-s3')
  async testS3Connection() {
    try {
      const s3Client = new S3Client({
        region: this.configService.get('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      });

      await s3Client.send(
        new HeadBucketCommand({
          Bucket: this.configService.get('AWS_S3_BUCKET'),
        })
      );

      return { message: 'S3 connection successful' };
    } catch (error) {
      console.error('S3 connection error:', error);
      throw new Error('Failed to connect to S3');
    }
  }

  @Post('upload/:type')
  @Public()
  @ApiOperation({ summary: 'Upload a business image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image uploaded successfully',
    type: UploadImageResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      })
    )
    file: Express.Multer.File,
    @Param('type') type: 'profile' | 'static'
  ): Promise<UploadImageResponseDto> {
    const imageType = type === 'profile' ? ImageType.PROFILE : ImageType.STATIC;
    const uploadedImage = await this.businessImageService.uploadImage(
      file,
      imageType
    );
    return new UploadImageResponseDto(uploadedImage);
  }

  @Post('refresh-url/:id')
  @Public()
  @ApiOperation({ summary: 'Refresh presigned URL for profile image' })
  async refreshPresignedUrl(
    @Param('id') id: string
  ): Promise<UploadImageResponseDto> {
    const refreshedImage =
      await this.businessImageService.refreshPresignedUrl(id);
    return new UploadImageResponseDto(refreshedImage);
  }
}
