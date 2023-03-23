import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from '../config';

export const jwtModuleRegister = () => JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<Config, true>) => ({
    secret: configService.get('jwtSecret', { infer: true }),
    signOptions: { expiresIn: '30 days' },
  }),
});
