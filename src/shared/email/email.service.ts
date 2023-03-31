import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config';
import sendGridClient from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService<Config, true>) {
    const apiKey = configService.get('emailApiKey', { infer: true });
    sendGridClient.setApiKey(apiKey);
  }

  async sendVerificationCode(email: string, header: string, code: string) {
    return sendGridClient.send({
      from: 'kevindelcastillo@ravn.co',
      to: email,
      templateId: 'd-5863036bba634ea882ea270efb033889',
      dynamicTemplateData: { header: header, verificationCode: code },
    });
  }
}
