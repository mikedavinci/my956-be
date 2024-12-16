// src/businesses/services/business-image.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BusinessImage } from './entities/business-image.entity';

export enum ImageType {
  PROFILE = 'profile',
  STATIC = 'static',
}

@Injectable()
export class BusinessImageService {
  private s3Client: S3Client;
  private readonly PRESIGNED_URL_EXPIRATION = 3600; // 1 hour in seconds

  constructor(
    @InjectRepository(BusinessImage)
    private businessImageRepository: Repository<BusinessImage>,
    private configService: ConfigService
  ) {
    console.log('AWS Region:', this.configService.get('AWS_REGION'));
    console.log(
      'AWS Access Key ID:',
      this.configService.get('AWS_ACCESS_KEY_ID')
    );
    console.log(
      'AWS Secret Access Key:',
      this.configService.get('AWS_SECRET_ACCESS_KEY')
    );

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
  async uploadImage(
    file: Express.Multer.File,
    imageType: ImageType
  ): Promise<BusinessImage> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG and PNG are allowed'
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    try {
      const uploadResult = await this.uploadToS3(file, imageType);
      let fileUrl: string;

      if (imageType === ImageType.PROFILE) {
        // For profile images, generate a presigned URL
        fileUrl = await this.generatePresignedUrl(uploadResult.Key);
      } else {
        // For static images, use the public URL
        fileUrl = `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${uploadResult.Key}`;
      }

      const businessImage = this.businessImageRepository.create({
        fileName: file.originalname,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        isPrivate: imageType === ImageType.PROFILE,
        s3Key: uploadResult.Key, // Store the S3 key for future presigned URL generation
      });

      return await this.businessImageRepository.save(businessImage);
    } catch (error) {
      throw new BadRequestException('Failed to upload image: ' + error.message);
    }
  }

  private async uploadToS3(file: Express.Multer.File, imageType: ImageType) {
    const bucketName = this.configService.get('AWS_S3_BUCKET');
    const folder =
      imageType === ImageType.PROFILE ? 'profile-images' : 'static-images';
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    const parallelUploads3 = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: imageType === ImageType.PROFILE ? 'private' : 'public-read',
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    await parallelUploads3.done();
    return { Key: key };
  }

  async generatePresignedUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: this.PRESIGNED_URL_EXPIRATION,
    });
  }

  // Method to refresh presigned URLs for profile images
  async refreshPresignedUrl(imageId: string): Promise<BusinessImage> {
    const image = await this.businessImageRepository.findOne({
      where: { id: imageId },
    });

    if (!image || !image.isPrivate) {
      throw new BadRequestException('Image not found or not a profile image');
    }

    image.fileUrl = await this.generatePresignedUrl(image.s3Key);
    return await this.businessImageRepository.save(image);
  }
}
