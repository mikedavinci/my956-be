// src/businesses/services/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QRCodeService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'https://my956.com';
  }

  private getBusinessProfileUrl(businessSlug: string): string {
    return `${this.baseUrl}/business-profile/${businessSlug}`;
  }

  async generateQRCode(businessSlug: string): Promise<string> {
    const profileUrl = this.getBusinessProfileUrl(businessSlug);

    const qrOptions: QRCode.QRCodeToStringOptions = {
      type: 'svg' as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    };

    try {
      return await QRCode.toString(profileUrl, qrOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateQRCodeBuffer(businessSlug: string): Promise<Buffer> {
    const profileUrl = this.getBusinessProfileUrl(businessSlug);

    const qrOptions: QRCode.QRCodeToBufferOptions = {
      type: 'png',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    try {
      const buffer = await QRCode.toBuffer(profileUrl, qrOptions);
      return buffer; // Explicitly return the buffer
    } catch (error) {
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  }
}
