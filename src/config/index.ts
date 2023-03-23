import { ConfigModule } from '@nestjs/config';

export interface Config {
  nodeEnv: NodeEnv,
  jwtSecret: string,
  port: string,
  redisUrl: string,
  emailApiKey: string,
}

export type OverridableConfig = Omit<Partial<Config>, 'nodeEnv'>

const nodeEnvValues = ['production', 'development', 'test'] as const;
export type NodeEnv = typeof nodeEnvValues[number];

function isValidNodeEnv(value: unknown): value is NodeEnv {
  return typeof value === 'string' && nodeEnvValues.includes(value as NodeEnv);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
if (!isValidNodeEnv(nodeEnv)) {
  throw new Error(`Received invalid value for environment variable NODE_ENV=${nodeEnv}`);
}

let overriddenConfigPath: string;
let envFilePath: string;

switch (nodeEnv) {
  case 'production':
    envFilePath = '.env.prod';
    overriddenConfigPath = './config.prod';
    break;
  case 'development':
    envFilePath = '.env.dev';
    overriddenConfigPath = './config.dev';
    break;
  case 'test':
    envFilePath = '.env.test';
    overriddenConfigPath = './config.test';
    break;
}

async function loadConfig(): Promise<Config> {
  const overriddenConfig: OverridableConfig = await import(overriddenConfigPath);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const config: Config = {
    nodeEnv: nodeEnv as NodeEnv,
    jwtSecret: process.env.JWT_SECRET!,
    port: process.env.PORT!,
    redisUrl: process.env.REDIS_URL!,
    emailApiKey: process.env.EMAIL_API_KEY!,
    ...overriddenConfig,
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  const undefinedKeys = Object
    .entries(config)
    .filter(([_, v]) => v === undefined)
    .map(([k, _]) => k);

  if (undefinedKeys.length !== 0) {
    throw new Error(`Config keys ${undefinedKeys} are undefined`);
  }

  return config;
}

export const configModuleForRoot = () => ConfigModule.forRoot({
  isGlobal: true,
  envFilePath,
  expandVariables: true,
  load: [loadConfig],
});
